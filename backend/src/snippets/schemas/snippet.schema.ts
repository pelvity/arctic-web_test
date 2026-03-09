import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SnippetDocument = Snippet & Document;

@Schema({ timestamps: true })
export class Snippet {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    content: string;

    @Prop({ type: [String], default: [] })
    tags: string[];

    @Prop({ required: true, enum: ['link', 'note', 'command'] })
    type: string;
}

export const SnippetSchema = SchemaFactory.createForClass(Snippet);

// Text indexes for efficient searching
SnippetSchema.index({ title: 'text', content: 'text' });
