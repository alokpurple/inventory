import { User } from "./user";

export interface Company {
    id: number;
    companyName: string;
    capacity: string;
    location: string;
    user?: User;
}
