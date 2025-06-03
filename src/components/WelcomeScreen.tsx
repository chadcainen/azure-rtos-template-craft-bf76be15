
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Cog, 
  Zap, 
  Atom, 
  Package, 
  Settings, 
  FileText,
  ArrowRight,
  Cpu,
  Shield,
  Wifi,
  HardDrive,
  Usb
} from 'lucide-react';
import { STM32_COLORS, STM32_GRADIENTS } from '@/styles/stm32-theme';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: Cog,
      title: 'Generate MX Files',
      description: 'Create STM32CubeMX configuration files for your target microcontroller',
      color: STM32_COLORS.primary,
    },
    {
      icon: Zap,
      title: 'Generate Packs',
      description: 'Build firmware packages for STM32 series with AZRTOS integration',
      color: STM32_COLORS.secondary,
    },
    {
      icon: Atom,
      title: 'Generate Applications',
      description: 'Create complete applications for specific STM32 boards',
      color: STM32_COLORS.accent,
    },
    {
      icon: Package,
      title: 'Full Pack Generation',
      description: 'Generate comprehensive packs including all applications',
      color: STM32_COLORS.success,
    },
    {
      icon: Settings,
      title: 'Configuration Manager',
      description: 'Manage and edit JSON configuration files',
      color: STM32_COLORS.warning,
    },
    {
      icon: FileText,
      title: 'Template Manager',
      description: 'Edit and manage Jinja2 template files',
      color: STM32_COLORS.error,
    },
  ];

  const middleware = [
    { name: 'ThreadX', icon: Cpu, description: 'Real-time operating system' },
    { name: 'FileX', icon: HardDrive, description: 'Embedded file system' },
    { name: 'NetX Duo', icon: Wifi, description: 'TCP/IP network stack' },
    { name: 'USBX', icon: Usb, description: 'USB host and device stack' },
    { name: 'LevelX', icon: Shield, description: 'NAND flash wear leveling' },
  ];

  return (
    <div className="min-h-screen" style={{ background: STM32_GRADIENTS.surface }}>
      {/* Header */}
      <div 
        className="relative overflow-hidden"
        style={{ background: STM32_GRADIENTS.header }}
      >
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/400')] opacity-10 bg-cover bg-center" />
        <div className="relative z-10 container mx-auto px-6 py-16 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mr-4">
              <Cpu className="w-10 h-10" style={{ color: STM32_COLORS.primary }} />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-white mb-2">
                STM32Cube Builder
              </h1>
              <p className="text-xl text-blue-100">for Azure RTOS</p>
            </div>
          </div>
          
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Professional development tool for generating MX files, firmware packs, and applications 
            for STM32 microcontrollers with Azure RTOS integration
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-8">
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
              v1.0.0 Professional Edition
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
              STMicroelectronics
            </Badge>
          </div>

          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-white text-blue-900 hover:bg-blue-50 font-semibold px-8 py-4 text-lg"
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4" style={{ color: STM32_COLORS.textPrimary }}>
            Powerful Development Tools
          </h2>
          <p className="text-lg" style={{ color: STM32_COLORS.textSecondary }}>
            Everything you need to develop with STM32 and Azure RTOS
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="transition-all duration-300 hover:shadow-lg border-0 shadow-sm"
                style={{ 
                  transform: hoveredFeature === index ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: hoveredFeature === index ? '0 20px 40px rgba(0,62,126,0.15)' : undefined
                }}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <CardHeader className="pb-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: feature.color }} />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Azure RTOS Middleware */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold mb-4" style={{ color: STM32_COLORS.textPrimary }}>
            Azure RTOS Middleware Support
          </h3>
          <p className="text-lg mb-8" style={{ color: STM32_COLORS.textSecondary }}>
            Integrated support for Microsoft Azure RTOS components
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {middleware.map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={index}
                  className="flex items-center gap-3 bg-white rounded-lg px-6 py-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <Icon className="w-6 h-6" style={{ color: STM32_COLORS.primary }} />
                  <div className="text-left">
                    <div className="font-semibold" style={{ color: STM32_COLORS.textPrimary }}>
                      {item.name}
                    </div>
                    <div className="text-sm" style={{ color: STM32_COLORS.textSecondary }}>
                      {item.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-12 border-t border-gray-200">
          <p style={{ color: STM32_COLORS.textSecondary }}>
            © {new Date().getFullYear()} STMicroelectronics - All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
