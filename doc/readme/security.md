## Security

By default his library assumes you have trusted input. The [exec](#exec) and [macro](#macro) directives can run arbitrary commands and execute arbitrary javascript if your input is untrusted set the `safe` option and these directives are no longer recognised.
