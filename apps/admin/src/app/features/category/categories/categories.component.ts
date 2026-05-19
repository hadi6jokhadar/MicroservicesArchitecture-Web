import { Component, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  CategoryService,
  ICategoryDto,
  TranslatePipe,
  TranslationService,
} from '@ihsan/core';
import {
  ZardAlertDialogService,
  ZardButtonComponent,
  ZardCardComponent,
  ZardDialogService,
  ZardDropdownImports,
  ZardEmptyComponent,
  ZardFormImports,
  ZardIconComponent,
  ZardIdDirective,
  ZardInputDirective,
  ZardLoaderComponent,
  ZardTableImports,
} from '@ihsan/ui';
import { toast } from 'ngx-sonner';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CategoryEventsService } from '../category-events.service';
import { AddEditCategoryDialogComponent } from './add-edit-category-dialog/add-edit-category-dialog.component';

interface ICategoryFilterForm {
  searchTerm: FormControl<string>;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardInputDirective,
    ZardCardComponent,
    TranslatePipe,
    ...ZardDropdownImports,
    ...ZardFormImports,
    ...ZardTableImports,
    ZardIconComponent,
    ZardLoaderComponent,
    ZardEmptyComponent,
    ZardIdDirective,
  ],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent implements OnInit {
  private readonly _categoryService = inject(CategoryService);
  private readonly _alertDialogService = inject(ZardAlertDialogService);
  private readonly _dialogService = inject(ZardDialogService);
  private readonly _translationService = inject(TranslationService);
  private readonly _categoryEvents = inject(CategoryEventsService);

  readonly categories = signal<ICategoryDto[]>([]);
  readonly isLoading = signal(false);
  /** Set of category IDs that are manually collapsed */
  readonly collapsedIds = signal<Set<number>>(new Set());

  // ── Drag-and-drop state ─────────────────────────────────────────────────
  readonly draggedNode = signal<ICategoryDto | null>(null);
  readonly dropTargetId = signal<number | null>(null);
  readonly isOverRootZone = signal(false);
  private _dragDescendantIds = new Set<number>();

  readonly filterForm = new FormGroup<ICategoryFilterForm>({
    searchTerm: new FormControl<string>('', { nonNullable: true }),
  });

  constructor() {
    this._categoryEvents.dataChanged$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.loadTree(this.filterForm.getRawValue().searchTerm));

    // Server-side search with debounce
    this.filterForm
      .get('searchTerm')!
      .valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((term) => this.loadTree(term));
  }

  ngOnInit(): void {
    this.loadTree();
  }

  loadTree(textFilter?: string): void {
    this.isLoading.set(true);
    this._categoryService.getTree(textFilter).subscribe({
      next: (tree) => {
        this.categories.set(tree);
        this.isLoading.set(false);
      },
      error: () => {
        toast.error(
          this._translationService.getCachedTranslation(
            'category.error.loadFailed',
          ),
        );
        this.isLoading.set(false);
      },
    });
  }

  /** Returns a flat list of rows with depth info for rendering */
  getFlatRows(
    nodes: ICategoryDto[] = this.categories(),
    depth = 0,
  ): { node: ICategoryDto; depth: number }[] {
    const rows: { node: ICategoryDto; depth: number }[] = [];
    for (const node of nodes) {
      rows.push({ node, depth });
      if (!this.collapsedIds().has(node.id) && node.children?.length) {
        rows.push(...this.getFlatRows(node.children, depth + 1));
      }
    }
    return rows;
  }

  isCollapsed(id: number): boolean {
    return this.collapsedIds().has(id);
  }

  toggleCollapse(id: number): void {
    const next = new Set(this.collapsedIds());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.collapsedIds.set(next);
  }

  hasChildren(node: ICategoryDto): boolean {
    return !!node.children?.length;
  }

  getDisplayName(node: ICategoryDto): string {
    return (
      node.nameTranslations?.['en'] ||
      node.nameTranslations?.['ar'] ||
      node.slug
    );
  }

  onClearFilters(): void {
    this.filterForm.reset({ searchTerm: '' });
  }

  // ── Drag-and-drop ───────────────────────────────────────────────────────

  onDragStart(event: DragEvent, node: ICategoryDto): void {
    this.draggedNode.set(node);
    this._dragDescendantIds = this._collectDescendantIds(node);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(node.id));
    }
  }

  onDragOver(event: DragEvent, node: ICategoryDto): void {
    if (!this._isValidDropTarget(node)) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    this.dropTargetId.set(node.id);
    this.isOverRootZone.set(false);
  }

  onDragOverRootZone(event: DragEvent): void {
    if (!this.draggedNode()) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    this.isOverRootZone.set(true);
    this.dropTargetId.set(null);
  }

  onDragLeave(event: DragEvent): void {
    // Only clear when truly leaving the element (not entering a child)
    const related = event.relatedTarget as HTMLElement | null;
    const current = event.currentTarget as HTMLElement;
    if (!related || !current.contains(related)) {
      this.dropTargetId.set(null);
    }
  }

  onDragLeaveRootZone(event: DragEvent): void {
    const related = event.relatedTarget as HTMLElement | null;
    const current = event.currentTarget as HTMLElement;
    if (!related || !current.contains(related)) {
      this.isOverRootZone.set(false);
    }
  }

  onDragEnd(): void {
    this.draggedNode.set(null);
    this.dropTargetId.set(null);
    this.isOverRootZone.set(false);
    this._dragDescendantIds = new Set();
  }

  onDrop(event: DragEvent, targetNode: ICategoryDto): void {
    event.preventDefault();
    const dragged = this.draggedNode();
    if (!dragged || !this._isValidDropTarget(targetNode)) {
      this.onDragEnd();
      return;
    }
    this._moveCategory(dragged, targetNode.id);
  }

  onDropRootZone(event: DragEvent): void {
    event.preventDefault();
    const dragged = this.draggedNode();
    if (!dragged) {
      this.onDragEnd();
      return;
    }
    this._moveCategory(dragged, null);
  }

  private _moveCategory(node: ICategoryDto, newParentId: number | null): void {
    this.onDragEnd();
    this._categoryService.move(node.id, { newParentId }).subscribe({
      next: () => {
        toast.success(
          this._translationService.getCachedTranslation(
            'category.success.moved',
          ),
        );
        this.loadTree(this.filterForm.getRawValue().searchTerm);
      },
      error: () => {
        toast.error(
          this._translationService.getCachedTranslation(
            'category.error.moveFailed',
          ),
        );
      },
    });
  }

  private _isValidDropTarget(target: ICategoryDto): boolean {
    const dragged = this.draggedNode();
    if (!dragged) return false;
    if (target.id === dragged.id) return false;
    if (this._dragDescendantIds.has(target.id)) return false;
    return true;
  }

  private _collectDescendantIds(node: ICategoryDto): Set<number> {
    const ids = new Set<number>();
    const collect = (n: ICategoryDto): void => {
      for (const child of n.children ?? []) {
        ids.add(child.id);
        collect(child);
      }
    };
    collect(node);
    return ids;
  }

  // ── Dialog actions ──────────────────────────────────────────────────────

  onAddRoot(): void {
    this._dialogService
      .create({
        zTitle: this._translationService.getCachedTranslation(
          'category.dialog.addTitle',
        ),
        zContent: AddEditCategoryDialogComponent,
        zHideFooter: true,
        zClosable: true,
        zWidth: '550px',
      })
      .afterClosed()
      .subscribe();
  }

  onAddChild(parent: ICategoryDto): void {
    this._dialogService
      .create({
        zTitle: this._translationService.getCachedTranslation(
          'category.dialog.addChildTitle',
        ),
        zContent: AddEditCategoryDialogComponent,
        zData: { category: { parentId: parent.id } as Partial<ICategoryDto> },
        zHideFooter: true,
        zClosable: true,
        zWidth: '550px',
      })
      .afterClosed()
      .subscribe();
  }

  onEdit(category: ICategoryDto): void {
    this._dialogService
      .create({
        zTitle: this._translationService.getCachedTranslation(
          'category.dialog.editTitle',
        ),
        zContent: AddEditCategoryDialogComponent,
        zData: { category },
        zHideFooter: true,
        zClosable: true,
        zWidth: '550px',
      })
      .afterClosed()
      .subscribe();
  }

  onDelete(category: ICategoryDto): void {
    this._alertDialogService.confirm({
      zTitle: this._translationService.getCachedTranslation(
        'category.dialog.deleteTitle',
      ),
      zDescription: this._translationService.getCachedTranslation(
        'category.dialog.deleteDescription',
      ),
      zOkText: this._translationService.getCachedTranslation('common.delete'),
      zCancelText:
        this._translationService.getCachedTranslation('common.cancel'),
      zOkDestructive: true,
      zOnOk: () => {
        this._categoryService.delete(category.id).subscribe({
          next: () => {
            toast.success(
              this._translationService.getCachedTranslation(
                'category.success.deleted',
              ),
            );
            this.loadTree(this.filterForm.getRawValue().searchTerm);
          },
          error: () => {
            toast.error(
              this._translationService.getCachedTranslation(
                'category.error.deleteFailed',
              ),
            );
          },
        });
      },
    });
  }
}
