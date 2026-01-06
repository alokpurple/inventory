import { Company } from "./company";

export interface User {
    id: number;
    username: string;
    password: string;
    role: string;
    company?: Company;
}
