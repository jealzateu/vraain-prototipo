import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuConstruccionComponent } from './menu-construccion.component';

describe('MenuConstruccionComponent', () => {
  let component: MenuConstruccionComponent;
  let fixture: ComponentFixture<MenuConstruccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuConstruccionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuConstruccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
