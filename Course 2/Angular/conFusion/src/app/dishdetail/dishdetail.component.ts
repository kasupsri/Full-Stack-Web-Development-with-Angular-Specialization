import { Component, Directive, OnInit, ViewChild } from '@angular/core';
import { Dish } from '../shared/dish';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { Comment } from '../shared/comment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
})

export class DishdetailComponent implements OnInit {
  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  dishCommentForm: FormGroup;
  dishComment: Comment;
  @ViewChild('commentForm') commentFormDirective;

  formErrors = {
    author: '',
    comment: '',
  };

  validationMessages = {
    author: {
      required: 'Author name is required.',
      minlength: 'Author name must be at least 2 characters long.',
    },
    comment: {
      required: 'Comment is required.',
    },
  };

  constructor(private dishService: DishService, private route: ActivatedRoute, private loation: Location, private fb: FormBuilder) {
    this.createForm();
  }

  ngOnInit() {
    this.dishService.getDishIds().subscribe(dishIds => (this.dishIds = dishIds));
    this.route.params.pipe(switchMap((params: Params) => this.dishService.getDish(params['id']))).subscribe(dish => {
      this.dish = dish;
      this.setPrevNext(dish.id);
    });
  }

  goBack(): void {
    this.loation.back();
  }
  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  createForm() {
    this.dishCommentForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2)]],
      rating: 5,
      comment: ['', [Validators.required]],
    });

    this.dishCommentForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
  }

  onValueChanged(data?: any) {
    if (!this.dishCommentForm) {
      return;
    }
    const form = this.dishCommentForm;
    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const message = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += message[key] + ' ';
        }
      }
    }
  }

  onSubmit() {
    if (this.dishCommentForm.value) {
      this.dishComment = new Comment();
      this.dishComment.author = this.dishCommentForm.value.author;
      this.dishComment.date = new Date().toISOString();
      this.dishComment.comment = this.dishCommentForm.value.comment;
      this.dishComment.rating = this.dishCommentForm.value.rating;

      this.dish.comments.push(this.dishComment);

      this.commentFormDirective.resetForm({
        author: '',
        rating: 5,
        comment: '',
      });
    }
  }
}
