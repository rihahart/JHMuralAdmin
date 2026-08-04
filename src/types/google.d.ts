// Minimal typings for the Google Identity Services script loaded in index.html.
interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdApi {
  initialize(config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }): void;
  renderButton(
    parent: HTMLElement,
    options: {
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "small" | "medium" | "large";
      text?: "signin_with" | "signup_with" | "continue_with";
      width?: number;
    }
  ): void;
  disableAutoSelect(): void;
}

interface Window {
  google?: {
    accounts: {
      id: GoogleIdApi;
    };
  };
}
