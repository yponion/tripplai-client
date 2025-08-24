/**
 * 성능 측정 유틸리티
 */
import React from 'react';

/**
 * 성능 측정 시작
 * @param markName 측정 이름
 */
export const startMeasure = (markName: string): void => {
  if (typeof window !== 'undefined' && window.performance) {
    window.performance.mark(`start_${markName}`);
  }
};

/**
 * 성능 측정 종료 및 결과 반환
 * @param markName 측정 이름
 * @returns 측정 결과 (밀리초)
 */
export const endMeasure = (markName: string): number | null => {
  if (typeof window !== 'undefined' && window.performance) {
    const startMark = `start_${markName}`;
    const endMark = `end_${markName}`;

    window.performance.mark(endMark);

    try {
      window.performance.measure(markName, startMark, endMark);
    } catch (e) {
      console.warn(`성능 측정 에러 (${markName}):`, e);
      return null;
    }

    const entries = window.performance.getEntriesByName(markName, 'measure');
    if (entries.length > 0) {
      const duration = entries[0].duration;
      // 콘솔에 측정 결과 출력 (개발 모드에서만)
      if (process.env.NODE_ENV !== 'production') {
        console.log(`성능 측정: ${markName}: ${duration.toFixed(2)}ms`);
      }
      return duration;
    }
  }
  return null;
};

/**
 * 컴포넌트 렌더링 성능 측정 훅
 * @param componentName 컴포넌트 이름
 */
export const useComponentPerformance = (componentName: string): void => {
  React.useEffect(() => {
    startMeasure(`render_${componentName}`);

    return () => {
      endMeasure(`render_${componentName}`);
    };
  }, [componentName]);
};

/**
 * 컴포넌트 렌더링 성능 측정 HOC
 * @param Component 측정할 컴포넌트
 * @param componentName 컴포넌트 이름
 */
export const withPerformanceTracking = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.FC<P> => {
  const WrappedComponent = (props: P) => {
    useComponentPerformance(componentName);
    return React.createElement(Component, props);
  };

  // displayName 설정
  WrappedComponent.displayName = `WithPerformanceTracking(${Component.displayName || Component.name || componentName || 'Component'
    })`;

  return WrappedComponent;
}; 