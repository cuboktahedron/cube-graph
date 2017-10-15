export default class CubeUtils {
  static SuffixPath = {
    '-3': "",
    '-2': "2",
    '-1': "'",
    '1': "",
    '2': "2",
    '3': "'",
  };

  static reversePath(paths: string) {
    const r = /(([UDRLFB]w?'*)|([EMSxyz]'*))([0-9]*)/g;
    const reversePathsArr: string[] = [];
    let m: RegExpExecArray;

    while ((m = r.exec(paths)) != null) {
      reversePathsArr.push(m[0]);
    }
    reversePathsArr.reverse();
    
    for (let i = 0; i < reversePathsArr.length; i++) {
      let reversePath = reversePathsArr[i];
      const basePath = CubeUtils.basePath(reversePath);
      if (CubeUtils.isReverse(reversePath)) {
        reversePath = basePath;
      } else {
        reversePath = basePath + "'";
      }

      reversePathsArr[i] = reversePath;
    }

    return reversePathsArr.join('');
  }

  static normalize(pPaths: string) {
    // Remove redundant reverse symbol.
    let paths = pPaths.replace(/''/g, "");

    // Remove repeat num.
    const pathsArr: string[] = CubeUtils.pathsToArray(paths);

    // Normalize
    const normalizedPathsArr: string[] = [];
    for (let i = 0; i < pathsArr.length; i++) {
      let path = pathsArr[i];
      let basePath = CubeUtils.basePath(path);
      let sign = CubeUtils.isReverse(path) ? -1 : 1;
      let continueCount = sign;
      while (i < pathsArr.length - 1) {
        let nextPath = pathsArr[i + 1];
        let isNextReverse = CubeUtils.isReverse(nextPath);
        let nextBasePath = CubeUtils.basePath(nextPath);
        if (basePath !== nextBasePath) {
          break;
        }
        continueCount += isNextReverse ? -1 : 1;
        i++;
      }

      continueCount %= 4;
      if (continueCount !== 0) {
        normalizedPathsArr.push(basePath + CubeUtils.SuffixPath[continueCount]);
      }
    }

    return normalizedPathsArr.join('');
  }

  static isReverse(path): boolean {
    const r = /^(([UDRLFB]w?)|([EMSxyz]))'$/;
    return r.test(path);
  }

  static basePath(path: string): string {
    if (path.charAt(1) == 'w') {
      return path.slice(0, 2);
    } else {
      return path.charAt(0);
    }
  }

  static pathsToArray(paths: string): string[] {
    const r = /(([UDRLFB]w?'*)|([EMSxyz]'*))([0-9]*)/g;
    const pathsArr: string[] = [];
    let m: RegExpExecArray;
    while ((m = r.exec(paths)) != null) {
      let times = m[4] ? +m[4] : 1;
      for (let i = 0; i < times; i++) {
        pathsArr.push(m[1]);
      }
    }

    return pathsArr;
  }
}
