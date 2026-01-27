
    export type GetProductsRequestType = {
        name?: string,
        category?: string,
        unit?:string,
        minStock?: number,
        code?:string,
        limit: number,
        page: number,
        // sortBy: Joi.string(),
    }