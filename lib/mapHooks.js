const humanizeDuration = require('humanize-duration');

module.exports = function(suiteHooks) {
  let hooks = [];
  for (let hookName of Object.keys(suiteHooks)) {
    const hook = suiteHooks[hookName];
    let hookResult = {};

    hookResult.start = hook.start;
    hookResult.end = hook.end;
    hookResult.duration = humanizeDuration(hook._duration);
    hookResult.title = hook.title;
    hookResult.associatedSuite = hook.parent;
    hookResult.associatedTest = hook.currentTest;

    if (hook.error) {
      if (hook.error.type) {
        hookResult.errorType = hook.error.type;
      }
      if (hook.error.message) {
        hookResult.error = hook.error.message;
      }
      if (hook.error.stack) {
        hookResult.standardError = hook.error.stack;
      }
    }

    hooks.push(hookResult);
  }
  return hooks;
};
