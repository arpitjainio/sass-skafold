"use client";

import { useState } from "react";
import { 
  // Design System Atoms
  Heading, 
  Text, 
  Box, 
  Container,
  // UI Components
  Badge, 
  Input, 
  Button, 
  Select, 
  Textarea, 
  Card, 
  Alert, 
  Icon, 
  Skeleton, 
  Avatar, 
  AvatarImage,
  AvatarFallback,
  Switch, 
  Checkbox, 
  Divider 
} from "@repo/ui";

export default function AtomsDemo() {
  const [switchChecked, setSwitchChecked] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  return (
    <Container className="py-8">
      <Heading level="h1" className="mb-8 text-center">
        Design System & UI Components Demo
      </Heading>

      {/* Design System Atoms */}
      <section className="mb-12">
        <Heading level="h2" className="mb-6">
          Design System Atoms
        </Heading>
        
        {/* Typography */}
        <Box padding="lg" background="muted" rounded="lg" className="mb-6">
          <Heading level="h3" className="mb-4">Typography</Heading>
          <div className="space-y-2">
            <Heading level="h1">Heading 1</Heading>
            <Heading level="h2">Heading 2</Heading>
            <Heading level="h3">Heading 3</Heading>
            <Text size="lg">Large Text</Text>
            <Text>Default Text</Text>
            <Text size="sm" variant="muted">Small Muted Text</Text>
          </div>
        </Box>

        {/* Layout */}
        <Box padding="lg" background="muted" rounded="lg" className="mb-6">
          <Heading level="h3" className="mb-4">Layout Components</Heading>
          <div className="space-y-4">
            <Box padding="md" background="primary" border="primary" rounded="md">
              <Text variant="primary" className="text-primary-foreground">Primary Box</Text>
            </Box>
            <Box padding="md" background="secondary" border="secondary" rounded="md">
              <Text variant="secondary">Secondary Box</Text>
            </Box>
            <Box padding="md" background="success" border="success" rounded="md">
              <Text variant="success" className="text-success-foreground">Success Box</Text>
            </Box>
          </div>
        </Box>
      </section>

      {/* UI Components */}
      <section className="mb-12">
        <Heading level="h2" className="mb-6">
          UI Components
        </Heading>

        {/* Badges */}
        <Box padding="lg" background="muted" rounded="lg" className="mb-6">
          <Heading level="h3" className="mb-4">Badges</Heading>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="info">Info</Badge>
          </div>
        </Box>

        {/* Input Fields */}
        <Box padding="lg" background="muted" rounded="lg" className="mb-6">
          <Heading level="h3" className="mb-4">Input Fields</Heading>
          <div className="space-y-4 max-w-md">
            <Input placeholder="Default input" />
            <Input placeholder="Error input" error="This field is required" />
            <Input placeholder="Success input" success />
            <Input placeholder="Small input" size="sm" />
            <Input placeholder="Large input" size="lg" />
          </div>
        </Box>

        {/* Buttons */}
        <Box padding="lg" background="muted" rounded="lg" className="mb-6">
          <Heading level="h3" className="mb-4">Buttons</Heading>
          <div className="flex flex-wrap gap-2">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="info">Info</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </Box>

        {/* Select */}
        <Box padding="lg" background="muted" rounded="lg" className="mb-6">
          <Heading level="h3" className="mb-4">Select</Heading>
          <div className="space-y-4 max-w-md">
            <Select>
              <option value="">Choose an option</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
              <option value="option3">Option 3</option>
            </Select>
            <Select error="Please select an option">
              <option value="">Select...</option>
              <option value="option1">Option 1</option>
            </Select>
          </div>
        </Box>

        {/* Textarea */}
        <Box padding="lg" background="muted" rounded="lg" className="mb-6">
          <Heading level="h3" className="mb-4">Textarea</Heading>
          <div className="space-y-4 max-w-md">
            <Textarea placeholder="Enter your message..." />
            <Textarea placeholder="Error textarea" error="Message is required" />
            <Textarea placeholder="Success textarea" success />
          </div>
        </Box>

        {/* Cards */}
        <Box padding="lg" background="muted" rounded="lg" className="mb-6">
          <Heading level="h3" className="mb-4">Cards</Heading>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <div className="p-6">
                <Heading level="h4" className="mb-2">Card Title</Heading>
                <Text variant="muted">This is a card description with some content.</Text>
              </div>
            </Card>
            <Card variant="outline">
              <div className="p-6">
                <Heading level="h4" className="mb-2">Outline Card</Heading>
                <Text variant="muted">This is an outline card variant.</Text>
              </div>
            </Card>
            <Card variant="elevated">
              <div className="p-6">
                <Heading level="h4" className="mb-2">Elevated Card</Heading>
                <Text variant="muted">This card has elevated shadow.</Text>
              </div>
            </Card>
          </div>
        </Box>

        {/* Alerts */}
        <Box padding="lg" background="muted" rounded="lg" className="mb-6">
          <Heading level="h3" className="mb-4">Alerts</Heading>
          <div className="space-y-4">
            <Alert variant="default">
              <Icon variant="info" className="mr-2">ℹ️</Icon>
              <Text>This is a default alert message.</Text>
            </Alert>
            <Alert variant="destructive">
              <Icon variant="destructive" className="mr-2">⚠️</Icon>
              <Text>This is a destructive alert message.</Text>
            </Alert>
            <Alert variant="success">
              <Icon variant="success" className="mr-2">✅</Icon>
              <Text>This is a success alert message.</Text>
            </Alert>
            <Alert variant="warning">
              <Icon variant="warning" className="mr-2">⚠️</Icon>
              <Text>This is a warning alert message.</Text>
            </Alert>
            <Alert variant="info">
              <Icon variant="info" className="mr-2">ℹ️</Icon>
              <Text>This is an info alert message.</Text>
            </Alert>
          </div>
        </Box>

        {/* Icons */}
        <Box padding="lg" background="muted" rounded="lg" className="mb-6">
          <Heading level="h3" className="mb-4">Icons</Heading>
          <div className="flex flex-wrap gap-4">
            <Icon variant="default" size="sm">🔍</Icon>
            <Icon variant="primary" size="md">⭐</Icon>
            <Icon variant="success" size="lg">✅</Icon>
            <Icon variant="warning" size="xl">⚠️</Icon>
            <Icon variant="destructive" size="2xl">❌</Icon>
          </div>
        </Box>

        {/* Skeletons */}
        <Box padding="lg" background="muted" rounded="lg" className="mb-6">
          <Heading level="h3" className="mb-4">Skeletons</Heading>
          <div className="space-y-4">
            <Skeleton size="sm" />
            <Skeleton size="md" />
            <Skeleton size="lg" />
            <Skeleton size="xl" />
            <div className="flex gap-4">
              <Skeleton variant="primary" size="md" />
              <Skeleton variant="success" size="md" />
              <Skeleton variant="warning" size="md" />
            </div>
          </div>
        </Box>

        {/* Avatars */}
        <Box padding="lg" background="muted" rounded="lg" className="mb-6">
          <Heading level="h3" className="mb-4">Avatars</Heading>
          <div className="flex flex-wrap gap-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" alt="User" />
              <AvatarFallback>CD</AvatarFallback>
            </Avatar>
          </div>
        </Box>

        {/* Interactive Components */}
        <Box padding="lg" background="muted" rounded="lg" className="mb-6">
          <Heading level="h3" className="mb-4">Interactive Components</Heading>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Text>Switch:</Text>
              <Switch 
                checked={switchChecked} 
                onCheckedChange={setSwitchChecked}
              />
              <Text variant="muted">{switchChecked ? 'On' : 'Off'}</Text>
            </div>
            <div className="flex items-center gap-4">
              <Text>Checkbox:</Text>
              <Checkbox 
                checked={checkboxChecked} 
                onCheckedChange={setCheckboxChecked}
              />
              <Text variant="muted">{checkboxChecked ? 'Checked' : 'Unchecked'}</Text>
            </div>
          </div>
        </Box>

        {/* Dividers */}
        <Box padding="lg" background="muted" rounded="lg" className="mb-6">
          <Heading level="h3" className="mb-4">Dividers</Heading>
          <div className="space-y-4">
            <Text>Content above</Text>
            <Divider />
            <Text>Content below</Text>
            <Divider variant="primary" />
            <Text>More content</Text>
            <Divider variant="success" />
            <Text>Final content</Text>
          </div>
        </Box>
      </section>
    </Container>
  );
} 