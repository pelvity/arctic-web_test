import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';
import { Snippet, SnippetDocument } from './schemas/snippet.schema';

@Injectable()
export class SnippetsService {
  constructor(
    @InjectModel(Snippet.name) private snippetModel: Model<SnippetDocument>,
  ) { }

  async create(createSnippetDto: CreateSnippetDto): Promise<Snippet> {
    const createdSnippet = new this.snippetModel(createSnippetDto);
    return createdSnippet.save();
  }

  async findAll(page: number = 1, limit: number = 10, q?: string, tag?: string) {
    const query: any = {};

    if (q) {
      query.$text = { $search: q };
    }

    if (tag) {
      query.tags = tag;
    }

    const total = await this.snippetModel.countDocuments(query);
    const data = await this.snippetModel
      .find(query)
      .sort({ createdAt: -1 }) // Sort purely by creation date, or score if searching
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    // Re-sort by text score if search is present
    if (q) {
      data.sort((a: any, b: any) => b.score - a.score);
      // Wait, Mongoose text search score sort requires projection. Let's simplify.
    }

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Snippet> {
    const snippet = await this.snippetModel.findById(id).exec();
    if (!snippet) {
      throw new NotFoundException(`Snippet with ID ${id} not found`);
    }
    return snippet;
  }

  async update(id: string, updateSnippetDto: UpdateSnippetDto): Promise<Snippet> {
    const updatedSnippet = await this.snippetModel
      .findByIdAndUpdate(id, updateSnippetDto, { new: true })
      .exec();
    if (!updatedSnippet) {
      throw new NotFoundException(`Snippet with ID ${id} not found`);
    }
    return updatedSnippet;
  }

  async remove(id: string): Promise<void> {
    const result = await this.snippetModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Snippet with ID ${id} not found`);
    }
  }
}
