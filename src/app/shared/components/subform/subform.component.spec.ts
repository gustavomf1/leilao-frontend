import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubformComponent } from './subform.component';

describe('SubformComponent', () => {
  let component: SubformComponent;
  let fixture: ComponentFixture<SubformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SubformComponent] }).compileComponents();
    fixture = TestBed.createComponent(SubformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('setModal() alterna a visibilidade do modal', () => {
    expect(component.visible).toBe(false);
    component.setModal(true);
    expect(component.visible).toBe(true);
    component.setModal(false);
    expect(component.visible).toBe(false);
  });
});
