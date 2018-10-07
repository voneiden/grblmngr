Grblmngr is a manager for grbl, duh. Grblmngr is primarily aimed to serve my own needs and therefore it aims to

* be responsive even with large files
* provide extra failsafe against user errors (accidental clicks, soft travel limits)
* be keyboard accessible
* smart autolevel for PCB manufacturing
* be a playground for experimental ideas

It's unlikely ever to have all the bells and whistles of [bCNC](https://github.com/vlachoudis/bCNC) 
or be as polished as [OpenCNCPilot](https://github.com/martin2250/OpenCNCPilot) so when in doubt check those out first. 

Install from source
====

Windows
----

On Windows you'll need VC++ build tools which you can get with if you don't have them installed

```
npm install --global windows-build-tools@3.1.0 --production
```



Development server
===

To run a electron development server run

```
npm run start
npm run electron
```

To run a browser development server (otherwise identical except no serial port access) run

```
npm run startweb
```

Build
===

The building of the electron app is a two stage process. The first stage builds the render side of the app
for the electron-renderer target, and the second stage packs the final application.

```
npm run build
cd build
npm install
npm run pack
```

Build for browser app is not yet implemented.



