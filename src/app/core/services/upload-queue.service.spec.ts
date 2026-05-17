import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { UploadQueueService } from './upload-queue.service';

describe('UploadQueueService', () => {
  let service: UploadQueueService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UploadQueueService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(UploadQueueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('queue$ emite array vazio inicialmente', (done) => {
    service.queue$.subscribe(q => {
      expect(Array.isArray(q)).toBeTrue();
      done();
    });
  });
});
