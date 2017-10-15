import { expect } from 'chai';
import CubeUtils from '../../../src/ts/models/CubeUtils';

describe('CubeUtils', function () {
  describe('#reversePath', function () {
    it(`should return "" when the value is ""`, function () {
      expect(CubeUtils.reversePath("")).to.equal("");
    });

    it(`should return "RU'F" when the value is "F'UR'"`, function () {
      expect(CubeUtils.reversePath("RU'F")).to.equal("F'UR'");
    });

    it(`should return "RwUw'Fw" when the value is "Fw'UwRw'"`, function () {
      expect(CubeUtils.reversePath("Fw'UwRw'")).to.equal("RwUw'Fw");
    });
  });

  describe('#normalize', function() {
    it(`should return "" when the value is ""`, function () {
      expect(CubeUtils.normalize("")).to.equal("");
    });

    it(`should return "U" when the value is "U''"`, function () {
      expect(CubeUtils.normalize("U'''")).to.equal("U'");
    });

    it(`should return "U2" when the value is "UU"`, function () {
      expect(CubeUtils.normalize("UU")).to.equal("U2");
    });

    it(`should return "U'" when the value is "UUU"`, function () {
      expect(CubeUtils.normalize("UUU")).to.equal("U'");
    });

    it(`should return "U" when the value is "UU'U`, function () {
      expect(CubeUtils.normalize("UU'U")).to.equal("U");
    });

    it(`should return "" when the value is "UU'DD'RR'LL'FF'BB'EE'MM'SS'"`, function () {
      expect(CubeUtils.normalize("UU'DD'RR'LL'FF'BB'EE'MM'SS'")).to.equal("");
    });

    it(`should return "" when the value is "xx'yy'zz'"`, function () {
      expect(CubeUtils.normalize("xx'yy'zz'")).to.equal("");
    });

    it(`should return "" when the value is "UwUw'DwDw'RwRw'LwLw'FwFw'BwBw'"`, function () {
      expect(CubeUtils.normalize("UwUw'DwDw'RwRw'LwLw'FwFw'BwBw'")).to.equal("");
    });

    it(`should return "UDRLFBEMS" when the value is "U'3D'3R'3L'3F'3B'3E'3M'3S'3"`, function () {
      expect(CubeUtils.normalize("U'3D'3R'3L'3F'3B'3E'3M'3S'3")).to.equal("UDRLFBEMS");
    });

    it(`should return "UwDwRwLwFwBw" when the value is "Uw'3Dw'3Rw'3Lw'3Fw'3Bw'3"`, function () {
      expect(CubeUtils.normalize("Uw'3Dw'3Rw'3Lw'3Fw'3Bw'3")).to.equal("UwDwRwLwFwBw");
    });

    it(`should return "xyz" when the value is "x'3y'3z'3"`, function () {
      expect(CubeUtils.normalize("x'3y'3z'3")).to.equal("xyz");
    });
  })
});
