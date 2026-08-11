import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || "Lỗi không xác định";
      const isDev = import.meta.env?.dev || import.meta.env?.MODE !== "production";

      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-screen items-center justify-center bg-[#F7F5FA] p-4">
          <div className="max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-xl">
            <h1 className="font-heading text-3xl font-bold text-red-600">
              Đã xảy ra lỗi
            </h1>
            <p className="mt-3 text-sm leading-7 text-[#7A6E71]">
              Một lỗi không mong muốn đã xảy ra. Vui lòng thử lại sau.
            </p>
            {isDev && (
              <pre className="mt-4 rounded-lg bg-red-50 p-3 text-left text-xs text-red-700 overflow-auto max-h-40">
                {errorMessage}
                {"\n\n"}
                {this.state.error?.stack}
              </pre>
            )}
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = "/";
              }}
              className="mt-6 inline-flex items-center rounded-xl bg-[#BC000A] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Quay về trang chủ
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
