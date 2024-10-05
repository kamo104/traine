{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
  packages = with pkgs; [ 
    nodePackages_latest.webpack-dev-server
    nodePackages_latest.webpack-cli
    nodePackages_latest.webpack
    nodePackages_latest.nodejs
  ];
}
