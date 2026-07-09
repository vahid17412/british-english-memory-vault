export interface INavigationService {
  readonly navigateTo: (route: string) => void;
  readonly getCurrentRoute: () => string;
}
