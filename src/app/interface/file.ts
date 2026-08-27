// export type ICloudinaryRes = {
//     asset_id: string;
//     public_id: string;
//     version: number;
//     version_id: string;
//     signature: string;
//     width: number;
//     height: number;
//     format: string;
//     resource_type: string;
//     created_at: string;
//     tags: string[];
//     bytes: number;
//     type: string;
//     etag: string;
//     placeholder: boolean;
//     url: string;
//     secure_url: string;
//     asset_folder: string;
//     display_name: string;
//     original_filename: string;
//     original_extension: string;
//     api_key: string;
//   };

export type ICloudinaryRes = {
    asset_id: string;
    public_id: string;
    version: number;
    version_id: string;
    signature: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    created_at: string;
    tags: string[];
    bytes: number;
    type: string;
    etag: string;
    placeholder?: boolean; // Make optional
    url: string;
    secure_url: string;
    asset_folder?: string; // Make optional
    display_name?: string; // Make optional
    original_filename: string;
    original_extension?: string; // Make optional
    api_key?: string;
};

export type IUser = {
    password: string;
    admin: {
        name: string;
        contactNumber: string;
        email: string;
        profilePhoto?: string;
    };
};

export type IFile = {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    filename: string;
    buffer: Buffer;
    path?: string;
    size: number;
};
