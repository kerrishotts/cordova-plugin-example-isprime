
#import <Cordova/CDV.h>

@interface CDVIsPrime : CDVPlugin
@end

@implementation CDVIsPrime

- (void)isPrime:(CDVInvokedUrlCommand*)command
{
    // note: want to make this cancelable? Consider NSOperation and NSOperationQueue
    // then this could be canceled when onReset is called
    [self.commandDelegate runInBackground:^{
        NSMutableDictionary* result = [[command argumentAtIndex: 0] mutableCopy];
        NSMutableArray* factors = result[@"factors"];
        int64_t candidate = [result[@"candidate"] longLongValue];
        int64_t half = candidate / 2;

        if (candidate == 2) {
            result[@"isPrime"] = @(YES);
        } else {
            // if we were only interested in testing primality, we could get by
            // with sqrt(candidate), but since we want the factors, we have to
            // go up to candidate/2.
            for (int64_t i = 2; i<=half; i++) {
                if ((candidate % i) == 0) {
                    [factors addObject:@(i)];
                }
            }
            if (factors.count == 0) {
                // no factors, so we're prime
                result[@"isPrime"] = @(YES);
            } else {
                // we are divisible by ourselves and 1
                [factors insertObject:@(1) atIndex:0];
                [factors addObject:@(candidate)];
            }
        }

        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:result];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}

@end
