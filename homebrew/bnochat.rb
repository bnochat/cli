class Bnochat < Formula
  desc "Terminal chat application"
  homepage "https://github.com/bnochat/cli"
  version "1.0.0"

  if OS.mac? && Hardware::CPU.arm?
    url "https://github.com/bnochat/cli/releases/download/v1.0.0/bnochat-macos-arm64"
    sha256 "REPLACE_WITH_ACTUAL_SHA256"
  elsif OS.mac?
    url "https://github.com/bnochat/cli/releases/download/v1.0.0/bnochat-macos-x64"
    sha256 "REPLACE_WITH_ACTUAL_SHA256"
  elsif OS.linux?
    url "https://github.com/bnochat/cli/releases/download/v1.0.0/bnochat-linux"
    sha256 "REPLACE_WITH_ACTUAL_SHA256"
  end

  def install
    if OS.mac? && Hardware::CPU.arm?
      bin.install "bnochat-macos-arm64" => "bnochat"
    elsif OS.mac?
      bin.install "bnochat-macos-x64" => "bnochat"
    else
      bin.install "bnochat-linux" => "bnochat"
    end
  end

  test do
    system "#{bin}/bnochat", "--version"
  end
end
