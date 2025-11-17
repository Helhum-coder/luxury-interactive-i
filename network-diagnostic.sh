#!/usr/bin/env bash
set -euo pipefail

# Network Configuration Helper Script
# This script helps diagnose and fix network connectivity issues

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Network Configuration & Security Diagnostic Tool      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_section() {
    echo
    echo -e "${BLUE}━━━ $1 ━━━${NC}"
    echo
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. System Information
print_section "System Information"

echo "Hostname: $(hostname)"
echo "User: $USER"
echo "Date: $(date)"
echo "Uptime: $(uptime -p 2>/dev/null || uptime)"

# 2. Network Interfaces
print_section "Network Interfaces"

if command_exists ip; then
    print_info "Network interfaces:"
    ip -brief addr
    echo
    print_info "Default route:"
    ip route show default
else
    print_warning "ip command not found, using ifconfig"
    ifconfig 2>/dev/null | grep -E "inet |inet6 " || echo "No network interfaces found"
fi

# 3. DNS Configuration
print_section "DNS Configuration"

if [ -f /etc/resolv.conf ]; then
    print_info "DNS servers:"
    cat /etc/resolv.conf | grep -E "^nameserver" | awk '{print "  " $2}'
else
    print_warning "/etc/resolv.conf not found"
fi

print_info "Testing DNS resolution:"
if command_exists nslookup; then
    if nslookup github.com >/dev/null 2>&1; then
        print_success "github.com resolves correctly"
    else
        print_error "Cannot resolve github.com"
    fi
else
    print_warning "nslookup not available"
fi

# 4. Listening Ports
print_section "Listening Ports"

print_info "TCP/UDP ports currently listening:"
if command_exists ss; then
    ss -tulpn 2>/dev/null | grep LISTEN | head -n 20 || sudo ss -tulpn | grep LISTEN | head -n 20
elif command_exists netstat; then
    netstat -tuln 2>/dev/null | grep LISTEN | head -n 20 || sudo netstat -tuln | grep LISTEN | head -n 20
else
    print_warning "Neither ss nor netstat found"
fi

# 5. Port Security Check
print_section "Port Security Check"

check_port() {
    local port=$1
    local name=$2
    
    if command_exists ss; then
        if ss -tuln 2>/dev/null | grep -q ":$port " || sudo ss -tuln 2>/dev/null | grep -q ":$port "; then
            # Check if bound to localhost only
            if ss -tuln 2>/dev/null | grep ":$port " | grep -q "127.0.0.1" || sudo ss -tuln 2>/dev/null | grep ":$port " | grep -q "127.0.0.1"; then
                print_success "Port $port ($name) - Secure (localhost only)"
            else
                print_warning "Port $port ($name) - May be exposed to network"
            fi
        else
            print_info "Port $port ($name) - Not listening"
        fi
    fi
}

check_port 3000 "React Dev"
check_port 5173 "Vite Dev"
check_port 5000 "Vite Preview"
check_port 4173 "Vite Build"
check_port 8080 "Alt HTTP"

# 6. Environment Variables
print_section "Environment Variables"

print_info "Checking proxy settings:"
if [ -z "${HTTP_PROXY:-}" ] && [ -z "${HTTPS_PROXY:-}" ]; then
    print_success "No proxy variables set"
else
    [ -n "${HTTP_PROXY:-}" ] && print_warning "HTTP_PROXY=$HTTP_PROXY"
    [ -n "${HTTPS_PROXY:-}" ] && print_warning "HTTPS_PROXY=$HTTPS_PROXY"
    [ -n "${NO_PROXY:-}" ] && print_info "NO_PROXY=$NO_PROXY"
fi

# 7. Firewall Status
print_section "Firewall Status"

if command_exists ufw; then
    print_info "UFW status:"
    sudo ufw status 2>/dev/null || echo "  Cannot check UFW status (may need sudo)"
fi

if command_exists iptables; then
    print_info "Active iptables rules:"
    sudo iptables -L -n 2>/dev/null | head -n 15 || echo "  Cannot check iptables (may need sudo)"
fi

# 8. Active Connections
print_section "Active Connections"

print_info "Established connections (first 10):"
if command_exists ss; then
    ss -tuna state established 2>/dev/null | head -n 11 || sudo ss -tuna state established | head -n 11
elif command_exists netstat; then
    netstat -tuna 2>/dev/null | grep ESTABLISHED | head -n 10 || sudo netstat -tuna | grep ESTABLISHED | head -n 10
fi

# 9. GitHub API Test
print_section "GitHub API Connectivity"

if command_exists curl; then
    print_info "Testing GitHub API..."
    if curl -s --max-time 5 https://api.github.com/zen >/dev/null 2>&1; then
        print_success "GitHub API is reachable"
        echo "  Message: $(curl -s https://api.github.com/zen)"
    else
        print_error "Cannot reach GitHub API"
    fi
    
    print_info "Testing GitHub main site..."
    if curl -s --max-time 5 https://github.com >/dev/null 2>&1; then
        print_success "GitHub.com is reachable"
    else
        print_error "Cannot reach GitHub.com"
    fi
else
    print_warning "curl not available for API testing"
fi

# 10. Port Forwarding (VS Code)
print_section "VS Code Port Forwarding"

if [ -n "${VSCODE_IPC_HOOK_CLI:-}" ] || [ -n "${CODESPACES:-}" ]; then
    print_info "Running in VS Code/Codespaces environment"
    print_warning "Check the 'PORTS' panel in VS Code to manage port forwarding"
    print_warning "Ensure all ports are set to 'Private' visibility"
else
    print_info "Not running in VS Code/Codespaces"
fi

# 11. Recommendations
print_section "Security Recommendations"

echo "1. Ensure ports are bound to 127.0.0.1 (localhost) when possible"
echo "2. Use private port forwarding in VS Code/Codespaces"
echo "3. Regularly rotate API tokens and credentials"
echo "4. Monitor active connections for unexpected traffic"
echo "5. Keep firewall rules restrictive and well-documented"
echo "6. Use HTTPS for all external communications"
echo "7. Never commit secrets to git repositories"

# 12. Quick Fix Commands
print_section "Quick Fix Commands"

echo "To clear proxy settings:"
echo "  unset HTTP_PROXY HTTPS_PROXY NO_PROXY"
echo
echo "To check if a specific port is in use:"
echo "  lsof -i :5173"
echo
echo "To kill a process on a specific port:"
echo "  lsof -ti:5173 | xargs kill -9"
echo
echo "To test port connectivity:"
echo "  nc -zv localhost 5173"
echo
echo "To view all environment variables:"
echo "  env | sort"
echo

print_section "Diagnostic Complete"

echo "For more detailed information, see NETWORK_SETUP_GUIDE.md"
echo "To run the interactive network diagnostic tool, open the application and click 'Network Diagnostics'"
echo

exit 0
