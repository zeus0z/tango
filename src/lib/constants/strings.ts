/**
 * strings.ts — All user-facing UI strings for the Tango app (pt-BR).
 *
 * Architecture: zero-dependency constants (no i18n library).
 * Single-locale: pt-BR only. Language toggle is out of scope (YAGNI).
 *
 * Usage:
 *   import { t } from '@/lib/constants/strings'
 *   <h1>{t.landing.headline}</h1>
 *   <p>{t.home.signedInAs(user.email)}</p>
 *
 * Interpolated strings are exported as small helper functions.
 * Do NOT translate: Japanese text, romaji, proper nouns (Genki, Tango, FSRS, Google).
 */

export const t = {
  // ── Common ────────────────────────────────────────────────────────────────
  common: {
    loading: 'Carregando…',
    backHome: '← Início',
    exit: '✕ Sair',
    next: 'Próximo →',
    returnHome: 'Voltar ao início',
    goHome: 'Ir ao início',
    reload: 'Recarregar',
    tryAgain: 'Tentar novamente',
    playPronunciation: 'Reproduzir pronúncia',
    showMnemonic: '💡 Ver mnemônico',
    cancel: 'Cancelar',
  },

  // ── Landing page ──────────────────────────────────────────────────────────
  landing: {
    headline: 'Aprenda japonês',
    // Pitch is split around the <strong>Genki I/II</strong> proper noun
    pitchPart1: 'Domine hiragana e katakana com repetição espaçada inteligente — baseado no currículo ',
    pitchPart2: '. Sem enrolação. Só kana.',
    featureFSRS: 'Algoritmo FSRS — agendamento inteligente',
    featureGenki: 'Hiragana e katakana na ordem do Genki',
    ctaSignup: "Comece agora — é grátis",
    ctaLogin: 'Já tem uma conta? Entrar',
    footerTagline: 'Feito para quem aprende.',
  },

  // ── Auth / Login ──────────────────────────────────────────────────────────
  auth: {
    loginSubtitle: 'Tango — aprenda japonês com SRS',
    welcomeTitle: 'Bem-vindo ao Tango',
    welcomeDescription: 'Entre com o Google para começar sua jornada no hiragana.',
    continueWithGoogle: 'Continuar com o Google',
    googleSignInError: 'Falha ao entrar com o Google. Tente novamente.',
    genericError: 'Algo deu errado. Tente novamente.',
    signOutError: 'Falha ao sair. Tente novamente.',
  },

  // ── Home ──────────────────────────────────────────────────────────────────
  home: {
    signedInAs: (email: string) => `Conectado como ${email}`,
    loadingUser: 'Carregando…',
    accountMenu: 'Menu da conta',
    signOut: 'Sair',
    dailyGoalHeading: 'Meta diária',
    dailyGoalLabel: 'Meta diária',
    dailyGoalAriaLabel: (learned: number, goal: number) =>
      `${learned} de ${goal} cartões aprendidos hoje`,
    goalReached: 'Meta atingida! Continue para reforçar a memória.',
    hiraganaProgress: 'Progresso do hiragana',
    loadingMap: 'Carregando mapa…',
    startSession: 'Iniciar uma sessão',
  },

  // ── Account page ──────────────────────────────────────────────────────────
  account: {
    title: 'Conta',
    appearanceHeading: 'Aparência',
    themeLabel: 'Tema',
    fontLabel: 'Fonte',
    accountHeading: 'Conta',
  },

  // ── Mastery states (for display only — do not change MasteryState type values) ──
  mastery: {
    Unseen: 'Não visto',
    Learning: 'Aprendendo',
    Review: 'Revisando',
    Mastered: 'Dominado',
  },

  // ── Session mode selector ─────────────────────────────────────────────────
  sessionMode: {
    heading: 'Iniciar uma sessão',
    learnLabel: 'Aprender',
    learnDescription: '5 novos + vencidos hoje',
    learnTip: 'Faça isso diariamente para se tornar fluente em japonês.',
    reviewRecentLabel: 'Revisar recentes',
    reviewRecentDescription: 'Últimos 7 dias, vencidos agora',
    reviewAllLabel: 'Revisar tudo',
    reviewAllDescription: 'Todos os vencidos hoje',
    infiniteLabel: 'Revisão infinita',
    infiniteDescription: 'Pratique todos os cartões aprendidos',
  },

  // ── Session page ──────────────────────────────────────────────────────────
  session: {
    loadingSession: 'Carregando sessão…',
    buildingSession: 'Preparando sua sessão…',
    failedToLoad: (message: string) => `Erro ao carregar sessão: ${message}`,
    unknownError: 'Erro desconhecido',
    emptyInfiniteTitle: (script: string) => `Você ainda não aprendeu nenhum ${script}!`,
    emptyReviewTitle: 'Nada para revisar agora!',
    emptyInfiniteHint: 'Aprenda alguns cartões primeiro e depois volte para praticar.',
    emptyReviewHint: 'Volte mais tarde ou tente um modo diferente.',
    couldNotSaveReview: 'Não foi possível salvar a revisão — verifique sua conexão.',
  },

  // ── Session summary ───────────────────────────────────────────────────────
  sessionSummary: {
    title: 'Sessão concluída!',
    subtitle: 'Veja como você foi',
    reviewed: 'Revisados',
    accuracy: 'Precisão',
    learned: 'Aprendidos',
    returnHome: 'Voltar ao início',
  },

  // ── Rating buttons ────────────────────────────────────────────────────────
  rating: {
    hard: 'Difícil',
    good: 'Bom',
    easy: 'Fácil',
  },

  // ── Introduce character ───────────────────────────────────────────────────
  introduce: {
    gotIt: 'Entendido →',
    memoryHook: 'Como lembrar',
    memoryHookWithRomaji: (romaji: string) => `Como lembrar (${romaji})`,
    // Already pt-BR — routed through strings for consistency
    promptQuiz: 'Qual som ele faz?',
  },

  // ── Infinite review ───────────────────────────────────────────────────────
  infiniteReview: {
    backHome: '← Início',
    title: 'Revisão infinita',
    // Inline-styled description (split at span boundaries)
    descPart1: 'Pratique ',
    descBold: 'todos os cartões que você já aprendeu',
    descPart2: ' de um script, em loop infinito. Ótimo para treinar antes de uma prova.',
    detailPart1: 'Isso é somente prática — ',
    detailBold: 'não afeta seu agendamento de repetição espaçada',
    detailPart2: '. Para progresso real, continue com as sessões de Aprender.',
    chooseScript: 'Escolha um script',
    loadingCount: 'Carregando…',
    noCardsYet: 'Nenhum cartão aprendido ainda',
    cardCount: (count: number) =>
      `${count} ${count !== 1 ? 'cartões' : 'cartão'} ${count !== 1 ? 'aprendidos' : 'aprendido'}`,
    startPractising: 'Começar a praticar',
    exit: '✕ Sair',
    reviewed: (count: number) => `${count} revisado${count !== 1 ? 's' : ''}`,
  },

  // ── Progress page ─────────────────────────────────────────────────────────
  progress: {
    title: 'Progresso',
    subtitle: 'Seu domínio do hiragana em um só lugar',
    hiraganaMap: 'Mapa do hiragana',
    loadingMap: 'Carregando mapa…',
    studyHistory: 'Histórico de estudos',
    loadingHistory: 'Carregando histórico…',
    noHistory:
      'Nenhum histórico ainda. Conclua uma sessão de estudo para ver sua atividade aqui.',
    weakCards: 'Cartões fracos',
    weakCardsDescription: 'Caracteres com a menor precisão (mín. 3 revisões)',
    loading: 'Carregando…',
  },

  // ── Character detail dialog ───────────────────────────────────────────────
  characterDetail: {
    characterAriaLabel: (character: string) => `Caractere: ${character}`,
    masteryLabel: 'Domínio',
    nextReview: 'Próxima revisão',
    reviews: 'Revisões',
    lapses: 'Erros',
    accuracy: 'Precisão',
    stability: 'Estabilidade',
    notStudiedYet:
      'Você ainda não estudou este caractere. Ele aparecerá assim que for introduzido em uma sessão.',
    // Relative date helpers
    today: 'Hoje',
    tomorrow: 'Amanhã',
    yesterday: 'Ontem (atrasado)',
    daysOverdue: (days: number) =>
      `${days} dia${days !== 1 ? 's' : ''} atrasado${days !== 1 ? 's' : ''}`,
    inDays: (days: number) => `Em ${days} dia${days !== 1 ? 's' : ''}`,
    inOneWeek: 'Em 1 semana',
    inWeeks: (weeks: number) => `Em ${weeks} semana${weeks !== 1 ? 's' : ''}`,
    inMonths: (months: number) => `Em ${months} mês${months !== 1 ? 'es' : ''}`,
    inYears: (years: number) => `Em ${years} ano${years !== 1 ? 's' : ''}`,
  },

  // ── Heatmap ───────────────────────────────────────────────────────────────
  heatmap: {
    // Brazilian Portuguese day abbreviations using ordinal notation to avoid
    // first-letter collisions (Seg/Sex/Sáb all start with S).
    // Dom, 2ª (Seg), 3ª (Ter), 4ª (Qua), 5ª (Qui), 6ª (Sex), Sáb
    // → displayed-day first chars are '2', '4', '6' — all distinct.
    dayLabels: ['Dom', '2ª', '3ª', '4ª', '5ª', '6ª', 'Sáb'] as const,
    displayedDays: ['2ª', '4ª', '6ª'] as const,
    // Month abbreviations (reliable 3-char, no locale API variance)
    months: [
      'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
      'jul', 'ago', 'set', 'out', 'nov', 'dez',
    ] as const,
    cellTooltip: (date: string, count: number) =>
      `${date}: ${count} revisão${count !== 1 ? 'ões' : ''}`,
    summary: (total: number, weeks: number) =>
      `${total.toLocaleString('pt-BR')} revisões nas últimas ${weeks} semanas`,
  },

  // ── Weak cards list ───────────────────────────────────────────────────────
  weakCards: {
    noWeakCards: 'Nenhum cartão fraco ainda — continue revisando!',
    characterAriaLabel: (character: string, romaji: string, accuracy: number) =>
      `${character} (${romaji}) — ${accuracy}% de precisão`,
  },

  // ── Reset progress ────────────────────────────────────────────────────────
  resetProgress: {
    sectionTitle: 'Redefinir todo o progresso',
    sectionDescription:
      'Apague todas as revisões e comece do zero como se a conta fosse nova. Isso não pode ser desfeito.',
    buttonLabel: 'Redefinir todo o progresso',
    dialogTitle: 'Redefinir todo o progresso?',
    dialogDescription:
      'Isso exclui permanentemente todas as revisões e todos os estados FSRS da sua conta. Seu mapa de hiragana ficará cinza e cada caractere precisará ser aprendido novamente. Esta ação não pode ser desfeita.',
    cancel: 'Cancelar',
    resetting: 'Redefinindo…',
    resetEverything: 'Redefinir tudo',
    successToast: 'Todo o progresso foi redefinido. Sua conta está como nova.',
    errorToast: 'Falha ao redefinir. Tente novamente.',
  },

  // ── Milestone banner ──────────────────────────────────────────────────────
  milestone: {
    formatGroupLabel: (groupName: string): string => {
      if (groupName === 'vowel') return 'grupo das vogais (あいうえお)'
      if (groupName === 'n') return 'ん isolado'
      return `grupo ${groupName}`
    },
    completedBanner: (groupLabel: string) => `Você concluiu o ${groupLabel}!`,
    tapToDismiss: 'Toque para dispensar',
    dismissAriaLabel: 'Dispensar banner de conquista',
  },

  // ── Alphabet progress map ─────────────────────────────────────────────────
  alphabet: {
    progressMapAriaLabel: 'Mapa de progresso do hiragana',
    cellAriaLabel: (character: string, romaji: string, mastery: string) =>
      `${character} (${romaji}) — ${mastery}`,
  },

  // ── Error states ──────────────────────────────────────────────────────────
  errors: {
    somethingWentWrong: 'Algo deu errado',
    unexpectedError: 'Um erro inesperado ocorreu.',
    appUpdated: 'O app foi atualizado. Recarregue para obter a versão mais recente.',
    tryRefreshing: 'Um erro inesperado ocorreu. Tente atualizar a página.',
    reload: 'Recarregar',
    tryAgain: 'Tentar novamente',
  },

  // ── MnemonicViewer (already pt-BR — routed here for completeness) ─────────
  mnemonic: {
    prevAriaLabel: 'Mnemônico anterior',
    nextAriaLabel: 'Próximo mnemônico',
  },
} as const
