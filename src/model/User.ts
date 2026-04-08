import mongoose, { Document, Schema } from 'mongoose';

export interface Message {
    content: string;
    createdAt: Date;
}

const MessageSchema: Schema<Message> = new Schema({
    content: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
});


export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    message: Message[];
    verifyCode: string;
    isVerified: boolean;
    isAcceptingMessages: boolean;
    verifyCodeExpires: Date;
}

const UserSchema: Schema<IUser> = new Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],       
    },
      isVerified: {
        type: Boolean,
        default: false,
    },
    verifyCode: {
        type: String,
        required: [true, 'Verification code is required'],
    },
    verifyCodeExpires: {
        type: Date,
        required: [true, 'Verification code expiration date is required'],
    },
    isAcceptingMessages: {
        type: Boolean,
        default: true,
    },
    message: [MessageSchema],
});


const UserModel = 
   (mongoose.models.User as mongoose.Model<IUser>) ||
   mongoose.model<IUser>('User', UserSchema);

   export default UserModel;
