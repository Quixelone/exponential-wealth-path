import { useState } from "react"
import { Helmet } from "react-helmet-async"
import { Copy, Check, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { StatusIndicator } from "@/components/ui/status-indicator"
import { ProgressBar } from "@/components/ui/progress-bar"
import { InfoCard } from "@/components/ui/info-card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast"

const DesignSystem = () => {
  const { toast } = useToast()
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSnippet(id)
    toast({
      title: "Copiato!",
      description: "Code snippet copiato negli appunti",
    })
    setTimeout(() => setCopiedSnippet(null), 2000)
  }

  const CodeSnippet = ({ code, id }: { code: string; id: string }) => (
    <div className="relative group">
      <pre className="bg-muted p-[var(--spacing-md)] rounded-[var(--radius-md)] overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => copyToClipboard(code, id)}
      >
        {copiedSnippet === id ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  )

  const ColorSwatch = ({ name, variable, light, dark }: { name: string; variable: string; light: string; dark: string }) => (
    <div className="space-y-[var(--spacing-xs)]">
      <div className={`h-20 rounded-[var(--radius-md)] border ${variable} shadow-sm`} />
      <div className="text-sm">
        <p className="font-semibold">{name}</p>
        <p className="text-muted-foreground text-xs">--{variable}</p>
        <p className="text-muted-foreground text-xs">L: {light}</p>
        <p className="text-muted-foreground text-xs">D: {dark}</p>
      </div>
    </div>
  )

  const SpacingExample = ({ size, value }: { size: string; value: string }) => (
    <div className="flex items-center gap-[var(--spacing-md)]">
      <div className="w-24 text-sm font-medium">{size}</div>
      <div className="w-16 text-sm text-muted-foreground">{value}</div>
      <div className={`h-8 bg-primary rounded-[var(--radius-sm)]`} style={{ width: value }} />
    </div>
  )

  return (
    <>
      <Helmet>
        <title>Design System - Component Library</title>
        <meta name="description" content="Comprehensive design system with components, tokens, and guidelines" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container py-[var(--spacing-2xl)]">
            <h1 className="text-4xl font-bold mb-[var(--spacing-xs)]">Design System</h1>
            <p className="text-muted-foreground">
              Comprehensive component library with design tokens and interactive examples
            </p>
          </div>
        </div>

        <div className="container py-[var(--spacing-2xl)] space-y-[var(--spacing-3xl)]">
          
          {/* Design Tokens */}
          <section className="space-y-[var(--spacing-xl)]">
            <div>
              <h2 className="text-3xl font-bold mb-[var(--spacing-xs)]">Design Tokens</h2>
              <p className="text-muted-foreground">Core design tokens for spacing, sizing, and radius</p>
            </div>

            <Tabs defaultValue="colors" className="w-full">
              <TabsList>
                <TabsTrigger value="colors">Colors</TabsTrigger>
                <TabsTrigger value="spacing">Spacing</TabsTrigger>
                <TabsTrigger value="sizing">Sizing</TabsTrigger>
                <TabsTrigger value="radius">Radius</TabsTrigger>
              </TabsList>

              <TabsContent value="colors" className="space-y-[var(--spacing-lg)]">
                <Card>
                  <CardHeader>
                    <CardTitle>Color Palette</CardTitle>
                    <CardDescription>Semantic color tokens using HSL format</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-[var(--spacing-md)]">
                      <ColorSwatch name="Primary" variable="bg-primary" light="220 90% 56%" dark="235 85% 65%" />
                      <ColorSwatch name="Secondary" variable="bg-secondary" light="28 100% 55%" dark="280 83% 62%" />
                      <ColorSwatch name="Success" variable="bg-success" light="134 61% 41%" dark="134 61% 46%" />
                      <ColorSwatch name="Warning" variable="bg-warning" light="45 93% 58%" dark="45 93% 63%" />
                      <ColorSwatch name="Danger" variable="bg-danger" light="0 72% 51%" dark="0 72% 56%" />
                      <ColorSwatch name="Info" variable="bg-info" light="195 85% 55%" dark="195 85% 60%" />
                      <ColorSwatch name="Muted" variable="bg-muted" light="220 13% 91%" dark="210 11% 15%" />
                      <ColorSwatch name="Accent" variable="bg-accent" light="220 20% 96%" dark="210 11% 12%" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="spacing" className="space-y-[var(--spacing-lg)]">
                <Card>
                  <CardHeader>
                    <CardTitle>Spacing Scale</CardTitle>
                    <CardDescription>Consistent spacing for padding, margin, and gaps</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-[var(--spacing-sm)]">
                    <SpacingExample size="xs" value="0.5rem" />
                    <SpacingExample size="sm" value="0.75rem" />
                    <SpacingExample size="md" value="1rem" />
                    <SpacingExample size="lg" value="1.5rem" />
                    <SpacingExample size="xl" value="2rem" />
                    <SpacingExample size="2xl" value="3rem" />
                    <SpacingExample size="3xl" value="4rem" />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sizing" className="space-y-[var(--spacing-lg)]">
                <Card>
                  <CardHeader>
                    <CardTitle>Size Scale</CardTitle>
                    <CardDescription>Standard sizes for buttons and interactive elements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-[var(--spacing-sm)]">
                    <SpacingExample size="xs" value="1.5rem" />
                    <SpacingExample size="sm" value="2rem" />
                    <SpacingExample size="md" value="2.5rem" />
                    <SpacingExample size="lg" value="3rem" />
                    <SpacingExample size="xl" value="4rem" />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="radius" className="space-y-[var(--spacing-lg)]">
                <Card>
                  <CardHeader>
                    <CardTitle>Border Radius</CardTitle>
                    <CardDescription>Consistent border radius across components</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-[var(--spacing-md)]">
                      {['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'].map((size) => (
                        <div key={size} className="space-y-[var(--spacing-xs)]">
                          <div className={`h-20 bg-primary/20 border-2 border-primary`} style={{ borderRadius: `var(--radius-${size})` }} />
                          <p className="text-sm font-medium">{size}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>

          {/* Buttons */}
          <section className="space-y-[var(--spacing-xl)]">
            <div>
              <h2 className="text-3xl font-bold mb-[var(--spacing-xs)]">Buttons</h2>
              <p className="text-muted-foreground">Button component with multiple variants and sizes</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-[var(--spacing-lg)]">
                <div className="flex flex-wrap gap-[var(--spacing-sm)]">
                  <Button variant="default">Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
                <div className="flex flex-wrap gap-[var(--spacing-sm)]">
                  <Button variant="success">Success</Button>
                  <Button variant="warning">Warning</Button>
                  <Button variant="info">Info</Button>
                  <Button variant="gradient">Gradient</Button>
                </div>
                <div className="flex flex-wrap gap-[var(--spacing-sm)]">
                  <Button variant="soft">Soft</Button>
                  <Button variant="soft-success">Soft Success</Button>
                  <Button variant="soft-warning">Soft Warning</Button>
                  <Button variant="soft-danger">Soft Danger</Button>
                </div>
                <div className="flex flex-wrap gap-[var(--spacing-sm)]">
                  <Button variant="glass">Glass</Button>
                  <Button variant="premium">Premium</Button>
                </div>
                <CodeSnippet
                  id="button-variants"
                  code={`<Button variant="default">Default</Button>
<Button variant="soft">Soft</Button>
<Button variant="glass">Glass</Button>
<Button variant="premium">Premium</Button>`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Button Sizes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-[var(--spacing-md)]">
                <div className="flex flex-wrap items-center gap-[var(--spacing-sm)]">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                  <Button size="icon">
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
                <CodeSnippet
                  id="button-sizes"
                  code={`<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>`}
                />
              </CardContent>
            </Card>
          </section>

          {/* Cards */}
          <section className="space-y-[var(--spacing-xl)]">
            <div>
              <h2 className="text-3xl font-bold mb-[var(--spacing-xs)]">Cards</h2>
              <p className="text-muted-foreground">Card component with various styles</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-md)]">
              <Card variant="default">
                <CardHeader>
                  <CardTitle>Default Card</CardTitle>
                  <CardDescription>Standard card style</CardDescription>
                </CardHeader>
                <CardContent>Card content goes here</CardContent>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Elevated Card</CardTitle>
                  <CardDescription>With shadow elevation</CardDescription>
                </CardHeader>
                <CardContent>Card content goes here</CardContent>
              </Card>

              <Card variant="glass">
                <CardHeader>
                  <CardTitle>Glass Card</CardTitle>
                  <CardDescription>Glassmorphism effect</CardDescription>
                </CardHeader>
                <CardContent>Card content goes here</CardContent>
              </Card>

              <Card variant="soft">
                <CardHeader>
                  <CardTitle>Soft Card</CardTitle>
                  <CardDescription>Subtle background</CardDescription>
                </CardHeader>
                <CardContent>Card content goes here</CardContent>
              </Card>

              <Card variant="interactive">
                <CardHeader>
                  <CardTitle>Interactive Card</CardTitle>
                  <CardDescription>Hover to scale</CardDescription>
                </CardHeader>
                <CardContent>Card content goes here</CardContent>
              </Card>

              <Card variant="premium">
                <CardHeader>
                  <CardTitle>Premium Card</CardTitle>
                  <CardDescription>Gradient with glow</CardDescription>
                </CardHeader>
                <CardContent>Card content goes here</CardContent>
              </Card>
            </div>

            <CodeSnippet
              id="card-variants"
              code={`<Card variant="default">...</Card>
<Card variant="glass">...</Card>
<Card variant="premium">...</Card>`}
            />
          </section>

          {/* Form Components */}
          <section className="space-y-[var(--spacing-xl)]">
            <div>
              <h2 className="text-3xl font-bold mb-[var(--spacing-xs)]">Form Components</h2>
              <p className="text-muted-foreground">Input, Textarea, and Select with variants</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Input Variants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-[var(--spacing-md)]">
                <Input variant="default" placeholder="Default input" />
                <Input variant="soft" placeholder="Soft input" />
                <Input variant="glass" placeholder="Glass input" />
                <Input variant="premium" placeholder="Premium input" />
                <Input variant="success" placeholder="Success input" />
                <Input variant="error" placeholder="Error input" />
                <CodeSnippet
                  id="input-variants"
                  code={`<Input variant="default" placeholder="Default" />
<Input variant="soft" placeholder="Soft" />
<Input variant="glass" placeholder="Glass" />`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Textarea & Select</CardTitle>
              </CardHeader>
              <CardContent className="space-y-[var(--spacing-md)]">
                <Textarea variant="default" placeholder="Default textarea" />
                <Textarea variant="soft" placeholder="Soft textarea" />
                <Select>
                  <SelectTrigger variant="default">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Option 1</SelectItem>
                    <SelectItem value="2">Option 2</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger variant="soft">
                    <SelectValue placeholder="Soft select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Option 1</SelectItem>
                    <SelectItem value="2">Option 2</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </section>

          {/* Badges & Alerts */}
          <section className="space-y-[var(--spacing-xl)]">
            <div>
              <h2 className="text-3xl font-bold mb-[var(--spacing-xs)]">Badges & Alerts</h2>
              <p className="text-muted-foreground">Status indicators and notifications</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Badge Variants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-[var(--spacing-md)]">
                <div className="flex flex-wrap gap-[var(--spacing-sm)]">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="danger">Danger</Badge>
                  <Badge variant="info">Info</Badge>
                </div>
                <div className="flex flex-wrap gap-[var(--spacing-sm)]">
                  <Badge variant="soft">Soft</Badge>
                  <Badge variant="soft-success">Soft Success</Badge>
                  <Badge variant="glass">Glass</Badge>
                  <Badge variant="premium">Premium</Badge>
                </div>
                <CodeSnippet
                  id="badge-variants"
                  code={`<Badge variant="success">Success</Badge>
<Badge variant="soft-success">Soft Success</Badge>`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alert Variants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-[var(--spacing-md)]">
                <Alert variant="default">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Default Alert</AlertTitle>
                  <AlertDescription>This is a default alert message.</AlertDescription>
                </Alert>

                <Alert variant="success">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>Operation completed successfully.</AlertDescription>
                </Alert>

                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>Please review before continuing.</AlertDescription>
                </Alert>

                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>An error occurred.</AlertDescription>
                </Alert>

                <Alert variant="glass">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Glass Alert</AlertTitle>
                  <AlertDescription>Glassmorphism style alert.</AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </section>

          {/* New Components */}
          <section className="space-y-[var(--spacing-xl)]">
            <div>
              <h2 className="text-3xl font-bold mb-[var(--spacing-xs)]">Advanced Components</h2>
              <p className="text-muted-foreground">StatusIndicator, ProgressBar, and InfoCard</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Status Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-[var(--spacing-md)]">
                <div className="flex flex-wrap gap-[var(--spacing-md)]">
                  <StatusIndicator variant="success">Active</StatusIndicator>
                  <StatusIndicator variant="warning" animate="pulse">Pending</StatusIndicator>
                  <StatusIndicator variant="danger">Error</StatusIndicator>
                  <StatusIndicator variant="primary" animate="ping">Live</StatusIndicator>
                  <StatusIndicator variant="info">Information</StatusIndicator>
                </div>
                <CodeSnippet
                  id="status-indicator"
                  code={`<StatusIndicator variant="success">Active</StatusIndicator>
<StatusIndicator variant="warning" animate="pulse">Pending</StatusIndicator>
<StatusIndicator variant="primary" animate="ping">Live</StatusIndicator>`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress Bars</CardTitle>
              </CardHeader>
              <CardContent className="space-y-[var(--spacing-lg)]">
                <ProgressBar value={75} variant="default" showLabel label="Default Progress" />
                <ProgressBar value={60} variant="success" showLabel label="Success Progress" />
                <ProgressBar value={40} variant="gradient" showLabel label="Gradient Progress" animated />
                <ProgressBar value={90} variant="gradient-success" showLabel label="Gradient Success" />
                <CodeSnippet
                  id="progress-bar"
                  code={`<ProgressBar value={75} variant="gradient" showLabel label="Progress" animated />`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Info Cards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-md)]">
                  <InfoCard
                    icon={CheckCircle}
                    title="Success"
                    description="Operation completed successfully"
                    variant="success"
                  />
                  <InfoCard
                    icon={AlertTriangle}
                    title="Warning"
                    description="Please review before continuing"
                    variant="warning"
                  />
                  <InfoCard
                    icon={AlertCircle}
                    title="Error"
                    description="An error occurred during processing"
                    variant="danger"
                  />
                  <InfoCard
                    icon={Info}
                    title="Information"
                    description="Additional details available"
                    variant="soft"
                  />
                </div>
                <div className="mt-[var(--spacing-md)]">
                  <CodeSnippet
                    id="info-card"
                    code={`<InfoCard
  icon={CheckCircle}
  title="Success"
  description="Operation completed"
  variant="soft-success"
/>`}
                  />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Accordion */}
          <section className="space-y-[var(--spacing-xl)]">
            <div>
              <h2 className="text-3xl font-bold mb-[var(--spacing-xs)]">Accordion</h2>
              <p className="text-muted-foreground">Collapsible content sections</p>
            </div>

            <Card>
              <CardContent className="pt-[var(--spacing-lg)]">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>What are design tokens?</AccordionTrigger>
                    <AccordionContent>
                      Design tokens are the visual design atoms of the design system. They store style values such as colors, spacing, and typography.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>How to use variants?</AccordionTrigger>
                    <AccordionContent>
                      Variants provide different visual styles for components. Use them via the variant prop, e.g., variant="soft" or variant="premium".
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Are components accessible?</AccordionTrigger>
                    <AccordionContent>
                      Yes, all components follow WCAG 2.1 guidelines with proper ARIA attributes, keyboard navigation, and focus management.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <div className="mt-[var(--spacing-md)]">
                  <CodeSnippet
                    id="accordion"
                    code={`<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Question</AccordionTrigger>
    <AccordionContent>Answer</AccordionContent>
  </AccordionItem>
</Accordion>`}
                  />
                </div>
              </CardContent>
            </Card>
          </section>

        </div>
      </div>
    </>
  )
}

export default DesignSystem
