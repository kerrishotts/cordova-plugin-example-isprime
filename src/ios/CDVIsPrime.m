#import <Cordova/CDV.h>

// type for block requiring a dictionary argument
typedef void (^KASResultCallback)(NSDictionary*);

// ----------------------------------------------------------------------------
#pragma mark - KASIsPrimeOperation interface

@interface KASIsPrimeOperation : NSOperation

@property BOOL isPaused;

@end

// ----------------------------------------------------------------------------
#pragma mark - KASIsPrimeOperation implementation

@implementation KASIsPrimeOperation

NSMutableDictionary* _result;
KASResultCallback _progress;
KASResultCallback _completion;
@synthesize isPaused;

- (id) initWithDictionary:(NSMutableDictionary *) dict progress:(KASResultCallback)progress completion:(KASResultCallback)completion
{
    self = [super init];
    if (self) {
        _result = dict;
        _progress = progress;
        _completion = completion;
        isPaused = false;

        self.queuePriority = NSOperationQueuePriorityLow;
        self.qualityOfService = NSOperationQualityOfServiceUserInitiated;
    }
    return self;

}

- (id) initWithCommand:(CDVInvokedUrlCommand*) command progress:(KASResultCallback)progress completion:(KASResultCallback)completion
{
    NSMutableDictionary* result = [[command argumentAtIndex: 0] mutableCopy];
    return [self initWithDictionary:result progress:progress completion:completion];
}


- (KASIsPrimeOperation *)createNewOperation
{
    return [[KASIsPrimeOperation alloc] initWithDictionary:_result progress:_progress completion:_completion];
}

- (void) main {
    NSMutableDictionary *result = _result;
    NSMutableArray* factors = result[@"factors"];
    int64_t candidate = [result[@"candidate"] longLongValue];
    int64_t half = candidate / 2;
    NSTimeInterval now = [[NSDate date] timeIntervalSince1970];
    NSTimeInterval cur = now;

    if (self.isCancelled) {
        return;
    }

    if (candidate == 2) {
        result[@"progress"] = @(100);
        result[@"complete"] = @(YES);
        result[@"isPrime"] = @(YES);
    } else {
        // if we were only interested in testing primality, we could get by
        // with sqrt(candidate), but since we want the factors, we have to
        // go up to candidate/2.
        uint64_t startAt = 2;
        if (result[@"cur"] != nil) {
            startAt = [result[@"cur"] longLongValue];
        }
        for (int64_t i = startAt; i<=half; i++) {
            if ((candidate % i) == 0) {
                // small chance of adding duplicate factors if we've been resumed, so make sure the factor we're adding
                // is truly unique.
                if ([factors indexOfObjectPassingTest:^BOOL(id  _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
                    return [obj longLongValue] == i;
                }] == NSNotFound) {
                    [factors addObject:@(i)];
                }
            }
            if (i % 10000 == 0) {
                if (self.isCancelled) {
                    result[@"cur"] = @(i);
                    break;
                }
                cur = [[NSDate date] timeIntervalSince1970];
                if (cur - now > 1) {
                    now = cur;
                    result[@"progress"] = @(((double)i / (double)half)*100);
                    _progress(result);
                }
            }
        }
        if (!self.isCancelled) {
            result[@"progress"] = @(100);
            result[@"complete"] = @(YES);
            if (factors.count == 0) {
                // no factors, so we're prime
                result[@"isPrime"] = @(YES);
            } else {
                // we are divisible by ourselves and 1
                [factors insertObject:@(1) atIndex:0];
                [factors addObject:@(candidate)];
            }
        }
    }

    if (!self.isCancelled) {
        _completion(result);
    }

}
@end

// ----------------------------------------------------------------------------
#pragma mark - CDVIsPrime interface

@interface CDVIsPrime : CDVPlugin
- (void)isPrime:(CDVInvokedUrlCommand*)command;
@end

// ----------------------------------------------------------------------------
#pragma mark - CDVIsPrime implementation

@implementation CDVIsPrime

NSOperationQueue* _opq;

- (void) _initOperationQueue
{
    _opq = [[NSOperationQueue alloc] init];
    _opq.name = @"QPrime";
    _opq.maxConcurrentOperationCount = 1;
    _opq.qualityOfService = NSQualityOfServiceUserInitiated;
}

- (void) _stopQueue
{
    [_opq cancelAllOperations];
}

- (void)pluginInitialize
{
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onPause) name:UIApplicationDidEnterBackgroundNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onResume) name:UIApplicationWillEnterForegroundNotification object:nil];
    [self _initOperationQueue];
}

- (void)isPrime:(CDVInvokedUrlCommand*)command
{
    KASIsPrimeOperation* op = [[KASIsPrimeOperation alloc] initWithCommand:command progress:^(NSDictionary* result) {
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:result];
        [pluginResult setKeepCallbackAsBool:YES];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    } completion:^(NSDictionary* result) {
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:result];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];

    [_opq addOperation:op];
}

- (void) dispose
{
    [self _stopQueue];
    _opq = nil;
}

- (void) onReset
{
    [self _stopQueue];
    [self _initOperationQueue];
}

- (void) onPause
{
    _opq.suspended = YES;
    if (_opq.operations.count > 0) {
        for (KASIsPrimeOperation* op in _opq.operations) {
            KASIsPrimeOperation* newOp = [op createNewOperation];
            [op cancel];
            [_opq addOperation:newOp];              // so this will pick back up where we left off when resumed
        }
    }
}

- (void) onResume
{
    _opq.suspended = NO;
}

@end
