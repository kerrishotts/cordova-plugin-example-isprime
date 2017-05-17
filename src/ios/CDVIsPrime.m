#import <Cordova/CDV.h>
@interface CDVIsPrime : CDVPlugin
@end
@implementation CDVIsPrime
- (void)isPrime:(CDVInvokedUrlCommand*)command {
  NSMutableDictionary* result = [[command argumentAtIndex:0] mutableCopy];
  NSMutableArray* factors = result[@"factors"];
  int64_t candidate = [result[@"candidate"] longLongValue];
  /* let there be a miracle: calculate if prime is a candidate */
  CDVPluginResult* r = [CDVPluginResult
    resultWithStatus:CDVCommandStatus_OK messageAsDictionary: result];
  [self.commandDelegate sendPluginResult:r callbackId:command.callbackId];
}
@end