import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  AiChatService,
  IAiTokenUsageStats,
  IAiTokenUsageStatsFilter,
  TranslatePipe,
} from '@ihsan/core';
import {
  ZardCardComponent,
  ZardIcon,
  ZardIconComponent,
  ZardLoaderComponent,
} from '@ihsan/ui';
import {
  Chart,
  BarController,
  BarElement,
  LineController,
  LineElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
  ChartConfiguration,
} from 'chart.js';
import { toast } from 'ngx-sonner';
import { TranslationService } from '@ihsan/core';

Chart.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

@Component({
  selector: 'app-token-usage-stats',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    ZardCardComponent,
    ZardIconComponent,
    ZardLoaderComponent,
  ],
  templateUrl: './token-usage-stats.component.html',
  styleUrls: ['./token-usage-stats.component.scss'],
})
export class TokenUsageStatsComponent implements AfterViewInit, OnDestroy {
  private readonly _aiChatService = inject(AiChatService);
  private readonly _translationService = inject(TranslationService);
  private readonly _cdr = inject(ChangeDetectorRef);

  readonly filter = input<IAiTokenUsageStatsFilter>({});

  readonly isLoading = signal(false);
  readonly stats = signal<IAiTokenUsageStats | null>(null);

  @ViewChild('tokensByModelCanvas')
  tokensByModelCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('tokensByEndpointCanvas')
  tokensByEndpointCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('tokensOverTimeCanvas')
  tokensOverTimeCanvas!: ElementRef<HTMLCanvasElement>;

  private _chartByModel: Chart | null = null;
  private _chartByEndpoint: Chart | null = null;
  private _chartOverTime: Chart | null = null;

  private readonly _chartColors = [
    'rgba(99, 102, 241, 0.8)',
    'rgba(14, 165, 233, 0.8)',
    'rgba(34, 197, 94, 0.8)',
    'rgba(251, 146, 60, 0.8)',
    'rgba(236, 72, 153, 0.8)',
    'rgba(168, 85, 247, 0.8)',
    'rgba(20, 184, 166, 0.8)',
    'rgba(245, 158, 11, 0.8)',
  ];

  readonly summaryCards = computed<
    { labelKey: string; value: string; icon: ZardIcon }[]
  >(() => {
    const s = this.stats();
    if (!s) return [];
    return [
      {
        labelKey: 'tokenUsageLogs.stats.totalTokens',
        value: s.total_tokens.toLocaleString(),
        icon: 'zap',
      },
      {
        labelKey: 'tokenUsageLogs.stats.totalRequests',
        value: s.total_requests.toLocaleString(),
        icon: 'activity',
      },
      {
        labelKey: 'tokenUsageLogs.stats.promptTokens',
        value: s.prompt_tokens.toLocaleString(),
        icon: 'arrow-up',
      },
      {
        labelKey: 'tokenUsageLogs.stats.completionTokens',
        value: s.completion_tokens.toLocaleString(),
        icon: 'arrow-right',
      },
      {
        labelKey: 'tokenUsageLogs.stats.avgTokensPerRequest',
        value: s.avg_tokens_per_request.toLocaleString(),
        icon: 'layers',
      },
    ];
  });

  private _initialized = false;

  constructor() {
    effect(() => {
      const f = this.filter();
      this.loadStats(f);
    });
  }

  ngAfterViewInit(): void {
    this._initialized = true;
    const s = this.stats();
    if (s) {
      this._buildCharts(s);
    }
  }

  ngOnDestroy(): void {
    this._destroyCharts();
  }

  loadStats(filter: IAiTokenUsageStatsFilter = {}): void {
    this.isLoading.set(true);
    this._aiChatService.getTokenUsageStats(filter).subscribe({
      next: (data) => {
        this.stats.set(data);
        this.isLoading.set(false);
        if (this._initialized) {
          this._cdr.detectChanges(); // flush CD so canvas elements are rendered
          this._buildCharts(data);
        }
      },
      error: () => {
        this.isLoading.set(false);
        toast.error(
          this._translationService.getCachedTranslation(
            'tokenUsageLogs.messages.statsLoadFailed'
          )
        );
      },
    });
  }

  private _destroyCharts(): void {
    this._chartByModel?.destroy();
    this._chartByEndpoint?.destroy();
    this._chartOverTime?.destroy();
    this._chartByModel = null;
    this._chartByEndpoint = null;
    this._chartOverTime = null;
  }

  private _buildCharts(stats: IAiTokenUsageStats): void {
    this._destroyCharts();

    // Tokens by model (horizontal bar)
    if (this.tokensByModelCanvas?.nativeElement) {
      const modelLabels = stats.tokens_by_model.map((m) => m.model_name);
      const config: ChartConfiguration<'bar'> = {
        type: 'bar',
        data: {
          labels: modelLabels,
          datasets: [
            {
              label: this._translationService.getCachedTranslation(
                'tokenUsageLogs.stats.promptTokens'
              ),
              data: stats.tokens_by_model.map((m) => m.prompt_tokens),
              backgroundColor: 'rgba(99, 102, 241, 0.7)',
              borderRadius: 4,
            },
            {
              label: this._translationService.getCachedTranslation(
                'tokenUsageLogs.stats.completionTokens'
              ),
              data: stats.tokens_by_model.map((m) => m.completion_tokens),
              backgroundColor: 'rgba(14, 165, 233, 0.7)',
              borderRadius: 4,
            },
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } },
          scales: { x: { stacked: true }, y: { stacked: true } },
        },
      };
      this._chartByModel = new Chart(
        this.tokensByModelCanvas.nativeElement,
        config
      );
    }

    // Tokens by endpoint (doughnut)
    if (this.tokensByEndpointCanvas?.nativeElement) {
      const endpointLabels = stats.tokens_by_endpoint.map((e) => e.endpoint);
      const doughnutConfig: ChartConfiguration<'doughnut'> = {
        type: 'doughnut',
        data: {
          labels: endpointLabels,
          datasets: [
            {
              data: stats.tokens_by_endpoint.map((e) => e.total_tokens),
              backgroundColor: this._chartColors.slice(
                0,
                endpointLabels.length
              ),
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'right' } },
        },
      };
      this._chartByEndpoint = new Chart(
        this.tokensByEndpointCanvas.nativeElement,
        doughnutConfig
      );
    }

    // Tokens over time (line)
    if (this.tokensOverTimeCanvas?.nativeElement) {
      const lineConfig: ChartConfiguration<'line'> = {
        type: 'line',
        data: {
          labels: stats.tokens_over_time.map((t) => t.date),
          datasets: [
            {
              label: this._translationService.getCachedTranslation(
                'tokenUsageLogs.stats.totalTokens'
              ),
              data: stats.tokens_over_time.map((t) => t.total_tokens),
              borderColor: 'rgba(99, 102, 241, 1)',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              borderWidth: 2,
              pointRadius: 4,
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } },
          scales: { y: { beginAtZero: true } },
        },
      };
      this._chartOverTime = new Chart(
        this.tokensOverTimeCanvas.nativeElement,
        lineConfig
      );
    }
  }
}
