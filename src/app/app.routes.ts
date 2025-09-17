import { Routes } from "@angular/router";
import { ArticleComponent } from "./components/three-d-object/article/article.component";
import { ThreeDObjectComponent } from "./components/three-d-object/three-d-object.component";

export const routes: Routes = [
  {
    path: "home",
    component: ThreeDObjectComponent,
  },
  { path: "article/:articleId", component: ArticleComponent },
  { path: "**", redirectTo: "home" },
];
