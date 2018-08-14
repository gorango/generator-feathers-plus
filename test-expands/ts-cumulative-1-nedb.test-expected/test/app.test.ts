/// <reference types="mocha"/>

import assert from 'assert';
import rp from 'request-promise';
import url from 'url';
import app from '../src1/app';

const port = app.get('port') || 3030;
const getUrl = (pathname?: string) => url.format({
  hostname: app.get('host') || 'localhost',
  protocol: 'http',
  port,
  pathname
});

describe('Feathers application tests', () => {
  let server;

  before(function (done) {
    server = app.listen(port);
    server.once('listening', () => done());
  });

  after(function (done) {
    server.close(done);
  });

  it('starts and shows the index page', () => {
    return rp(getUrl()).then((body: string) =>
      assert.ok(body.indexOf('<html>') !== -1)
    );
  });

  describe('404', function () {
    it('shows a 404 HTML page', () => {
      return rp({
        url: getUrl('path/to/nowhere'),
        headers: {
          Accept: 'text/html'
        }
      }).catch(res => {
        assert.equal(res.statusCode, 404);
        assert.ok(res.error.indexOf('<html>') !== -1);
      });
    });

    it('shows a 404 JSON error without stack trace', () => {
      return rp({
        url: getUrl('path/to/nowhere'),
        json: true
      }).catch(res => {
        assert.equal(res.statusCode, 404);
        assert.equal(res.error.code, 404);
        assert.equal(res.error.message, 'Page not found');
        assert.equal(res.error.name, 'NotFound');
      });
    });
  });
});