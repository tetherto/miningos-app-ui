import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

interface WithNoFeaturesRestrictionProps {
  noFeatureCheck?: boolean
}

const withNoFeaturesRestriction = <P,>(
  Component: ComponentType<P & WithNoFeaturesRestrictionProps>,
): ComponentType<P> => {
  const WrappedComponent = (props: P) => (
    <Component {...(props as P & WithNoFeaturesRestrictionProps)} noFeatureCheck />
  )

  WrappedComponent.displayName = `withNoFeaturesRestriction(${Component.displayName || Component.name})`

  return WrappedComponent
}

export const lazyWithNoFeatures = <P,>(
  importFn: () => Promise<{ default: ComponentType<P & WithNoFeaturesRestrictionProps> }>,
): LazyExoticComponent<ComponentType<P>> =>
  lazy(async () => {
    const module = await importFn()

    return { default: withNoFeaturesRestriction(module.default) }
  })
