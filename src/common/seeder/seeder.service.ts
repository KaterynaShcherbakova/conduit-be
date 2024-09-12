import { Injectable } from '@nestjs/common';
import { TagEntity } from 'src/modules/tag/tag.entity';
import { TagService } from 'src/modules/tag/tag.service';

@Injectable()
export class SeederService {
  constructor(private readonly tagService: TagService) {}

  async seed() {
    await this.seedTags();
  }

  private async seedTags() {
    const existingTags = await this.tagService.findAll(); 

    if (existingTags.length > 0) {
      return;
    }

    const tags = [
      { name: 'coffee' },
      { name: 'nestjs' },
    ];
    for (const tag of tags) {
      await this.tagService.create(tag); 
    }
  }
}
