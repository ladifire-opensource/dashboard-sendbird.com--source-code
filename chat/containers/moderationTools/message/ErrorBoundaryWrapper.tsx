import { ReactNode } from 'react';
import { ErrorBoundary, ErrorBoundaryPropsWithComponent } from 'react-error-boundary';

type Props = Omit<ErrorBoundaryPropsWithComponent, 'FallbackComponent'> & {
  FallbackComponent?: ErrorBoundaryPropsWithComponent['FallbackComponent'];
  children: () => ReactNode;
};

const DefaultFallbackComponent = () => null;

const ComponentThatMayError = ({ children }: Pick<Props, 'children'>) => <>{children()}</>;

export const ErrorBoundaryWrapper = ({
  children,
  FallbackComponent = DefaultFallbackComponent,
  ...errorBoundaryProps
}: Props) => {
  return (
    <ErrorBoundary FallbackComponent={FallbackComponent} {...errorBoundaryProps}>
      <ComponentThatMayError>{children}</ComponentThatMayError>
    </ErrorBoundary>
  );
};
