import { formatDateString } from '../lib/utils';
import chai from 'chai';
import { enGB } from 'date-fns/locale';

const expect = chai.expect;

describe('formatDateString', () => {
  it('Should return formatted date', () => {
    const expectedDate = 'September 20, 2019 21:50:42';
    const actualDate = formatDateString('2019-09-20T20:50:42.399Z', enGB);
    expect(actualDate).to.be.eql(expectedDate);
  });

  it('Should return parameter if cannot format', () => {
    const expectedDate = '12345';
    const actualDate = formatDateString('12345');
    expect(actualDate).to.be.eql(expectedDate);
  });
});
