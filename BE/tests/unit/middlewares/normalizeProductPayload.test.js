const fs = require('fs');
const normalizeProductPayload = require('../../../src/middlewares/normalizeProductPayload');

jest.mock('../../../src/config/logger', () => ({
  warn: jest.fn(),
}));

describe('normalizeProductPayload middleware', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const runMiddleware = async (reqOverrides = {}) => {
    const req = { body: {}, ...reqOverrides };
    const res = {};
    const next = jest.fn();
    await normalizeProductPayload(req, res, next);
    return { req, next };
  };

  it('chuẩn hóa số và boolean từ multipart/text', async () => {
    const { req, next } = await runMiddleware({
      body: { minStock: ' 7 ', removeImage: 'ON' },
    });

    expect(req.body.minStock).toBe(7);
    expect(req.body.removeImage).toBe(true);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('trim string và bỏ qua chuỗi rỗng', async () => {
    const { req } = await runMiddleware({
      body: { code: '  PRD-001  ', name: '  Sản phẩm  ', unit: '   ', package: '\tHộp ' },
    });

    expect(req.body.code).toBe('PRD-001');
    expect(req.body.name).toBe('Sản phẩm');
    expect(req.body.package).toBe('Hộp');
    expect(req.body).not.toHaveProperty('unit');
  });

  it('loại bỏ minStock rỗng để Joi áp dụng default', async () => {
    const { req } = await runMiddleware({
      body: { minStock: '   ' },
    });

    expect(req.body).not.toHaveProperty('minStock');
  });

  it('cung cấp cleanupUploadedFile xoá file đúng 1 lần', async () => {
    const unlinkSpy = jest.spyOn(fs.promises, 'unlink').mockResolvedValue();
    const { req } = await runMiddleware({
      file: { path: '/tmp/any-image.jpg' },
    });

    await req.cleanupUploadedFile();
    await req.cleanupUploadedFile();

    expect(unlinkSpy).toHaveBeenCalledTimes(1);
    expect(unlinkSpy).toHaveBeenCalledWith('/tmp/any-image.jpg');
  });
});
