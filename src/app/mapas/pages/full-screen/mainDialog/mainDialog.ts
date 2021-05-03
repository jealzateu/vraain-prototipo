import { Component, Inject, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-main-dialog',
  templateUrl: 'mainDialog.html',
})
export class MainDialogComponent implements OnInit{

  public o: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.o = this.data.opt;
  }
}
