import { Injectable } from "@angular/core";
import { Post } from "./post.model";
import { map, Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";

//Injectable means only one instance will be created to be shared with all components
@Injectable({providedIn: 'root'}) //Allow this file to be accessed from the root
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();//Payload = list of posts

  constructor(private httpClient: HttpClient) {}

  getPosts() {
    this.httpClient
      .get<{ message: string; posts: any }>(
        "http://localhost:3000/api/posts"
      )
      .pipe(map((postData) => { //Operator from rxjs //We map because DB returns _id, whereas we use id
        return postData.posts.map((post: { title: string; content: string; _id: string; }) => {
          return {
            title: post.title,
            content: post.content,
            id: post._id
          }
        });
      }))
      .subscribe(transformedPosts => {
        this.posts = transformedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable(); //Can ommit but not emmit
  }

  addPost(title: string, content: string){
    const post: Post = {
      id: "",
      title: title,
      content: content}

    this.httpClient.post<{message: string, }>("http://localhost:3000/api/posts", post)
    .subscribe((responseData) => { //On Success
      console.log(responseData.message);
      this.posts.push(post); //update local data
      this.postsUpdated.next([...this.posts]);//Omits a new copy of this posts after update
    });
  }

  deletePost(postId: string){
    this.httpClient.delete("http://localhost:3000/api/posts/" + postId)
      .subscribe(() => {
        const updatedPosts = this.posts.filter(post => { //For each post in arr
          post.id != postId; //Delete the selected from the array to match the DB
          this.posts = updatedPosts;
          this.postsUpdated.next([...this.posts])
        });
        console.log("Post deleted");
      });
  }

}



//Subjects can be actively triggered from code i.e. this.postsUpdated.next();
//Observables are passively triggered by wraps callback, events...
