export const cookieOption = {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    maxAge: 1000 * 60 * 60 * 24, // 24 hour 0 minutes in milliseconds
    path: '/'
};
