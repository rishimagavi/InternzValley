import { Trans } from "@lingui/react";

type Props = {
  message?: string | null;
};

export const LoadingScreen = ({ message }: Props) => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-2 text-2xl font-bold">
          <Trans id="loading">Loading...</Trans>
        </div>
        {message ? (
          <div className="text-sm text-red-500">{message}</div>
        ) : (
          <div className="text-sm opacity-75">
            <Trans id="loading.message">Please wait while we load your preferred language.</Trans>
          </div>
        )}
      </div>
    </div>
  );
}; 