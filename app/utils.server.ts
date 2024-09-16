import bcrypt from "bcryptjs";

export const createHashedPassword = async ({password}: {password: string;}) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return {hashedPassword};
};

