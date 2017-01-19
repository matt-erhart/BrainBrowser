import { BrainBrowserPage } from './app.po';

describe('brain-browser App', function() {
  let page: BrainBrowserPage;

  beforeEach(() => {
    page = new BrainBrowserPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
