#!/bin/bash

git describe | { read message; git push origin "$message"; }

