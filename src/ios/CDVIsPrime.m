#import <Cordova/CDV.h>

@interface CDVIsPrime : CDVPlugin
@end

@implementation CDVIsPrime
- (void)isPrime:(CDVInvokedUrlCommand*)command
{
    NSMutableDictionary* result = [[command argumentAtIndex: 0] mutableCopy];
    NSMutableArray* factors = result[@"factors"];
    int64_t candidate = [result[@"candidate"] longLongValue];
    int64_t half = candidate / 2;
    NSTimeInterval now = [[NSDate date] timeIntervalSince1970];
    NSTimeInterval cur = now;

    if (candidate == 2) { // [1]
        result[@"progress"] = @(100); // [5]
        result[@"complete"] = @(YES); // [5]
        result[@"isPrime"] = @(YES);
    } else {
        for (int64_t i = 2; i<=half; i++) {
            result[@"progress"] = @(((double)i / (double)half)*100);
            if ((candidate % i) == 0) {
                [factors addObject:@(i)];
            }
            if (i % 1000 == 0) {
                cur = [[NSDate date] timeIntervalSince1970];
                if (cur - now > 1) { // [6]
                    now = cur;
                    // [2]
                    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:result];
                    // [3]
                    [pluginResult setKeepCallbackAsBool:YES];
                    // [4]
                    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
                }
            }
        }
        result[@"progress"] = @(100);
        result[@"complete"] = @(YES);
        if (factors.count == 0) {
            result[@"isPrime"] = @(YES);
        } else {
            [factors insertObject:@(1) atIndex:0];
            [factors addObject:@(candidate)];
        }
    }
    // [2]
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:result];
    // [4]
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}
@end