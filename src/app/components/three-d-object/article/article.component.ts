import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
  selector: 'app-article',
  imports: [MarkdownComponent],
  templateUrl: './article.component.html',
  styleUrl: './article.component.scss'
})
export class ArticleComponent {
  private activatedRoute = inject(ActivatedRoute);
  articleId: string = '';

  ngOnInit() {
    this.articleId = this.activatedRoute.snapshot.paramMap.get('articleId')!;
  }
}
