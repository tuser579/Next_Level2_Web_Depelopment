export type IIssue = {
    title: string;
    description: string;
    type: string;
}

export type IUser = {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface IIssueFromDB extends IIssue {
    id: string;
    status: string;
    reporter_id: string;
    created_at: Date;
    updated_at: Date;
}

export interface IUserFromDB {
    id: string;
    name: string;
    role: string;
}

export type IIssueQuery = {
    sort?: "newest" | "oldest";
    type?: string;
    status?: string;
}