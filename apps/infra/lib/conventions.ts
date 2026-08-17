export interface NamingProps {
  orgPrefix: string;
  environment: string;
  workload: string;
  locationShort: string;
}

export function naming({
  orgPrefix: org,
  environment: env,
  workload: wl,
  locationShort: loc,
}: NamingProps) {
  const prefix = `${org}-${env}-${wl}-${loc}`;
  return {
    siteBucket: `${prefix}-s3-01`,
    authFn: `${prefix}-fn-01`,
    authSecret: `${org}/${env}/${wl}/lambda-auth`,
    ssmEnvParam: (app: string) => `/${org}/${env}/${wl}/${app}/env`,
    ciDeployRole: `${org}-ci-${wl}-${loc}-role`,
  };
}

export function defaultTags({
  orgPrefix: org,
  environment: env,
  workload: wl,
}: Omit<NamingProps, 'locationShort'>) {
  return {
    Environment: env,
    Workload: wl,
    Organisation: org,
    ManagedBy: 'cdk',
  };
}
