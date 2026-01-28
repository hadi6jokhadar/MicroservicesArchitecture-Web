import { cva, type VariantProps } from 'class-variance-authority';

export const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm flex items-center gap-3',
  {
    variants: {
      zType: {
        default: 'bg-card text-card-foreground',
        destructive: 'text-destructive bg-card',
        success:
          'bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-100 border-green-200 dark:border-green-800',
      },
    },
    defaultVariants: {
      zType: 'default',
    },
  }
);

export const alertIconVariants = cva('shrink-0 self-start text-base!');

export const alertTitleVariants = cva(
  'font-medium tracking-tight leading-none'
);

export const alertDescriptionVariants = cva('text-sm leading-relaxed mt-1', {
  variants: {
    zType: {
      default: 'text-muted-foreground',
      destructive: 'text-destructive/90',
      success: 'text-green-800 dark:text-green-200',
    },
  },
  defaultVariants: {
    zType: 'default',
  },
});

export type ZardAlertTypeVariants = NonNullable<
  VariantProps<typeof alertVariants>['zType']
>;
