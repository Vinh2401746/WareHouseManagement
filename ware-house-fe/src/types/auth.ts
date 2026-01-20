export type AuthRequestLoginType = {
  email: string;
  password: string;
};

export type AuthResponseLoginType = {
  user: {
    role: string;
    isEmailVerified: boolean;
    email: string;
    name: string;
    id: string;
  };
  tokens: {
    access: {
      token: string | null;
      expires: Date | null;
    };
    refresh: {
      token: string | null;
      expires: Date | null;
    };
  };
};


export type roles = 'admin' | 'user' | null