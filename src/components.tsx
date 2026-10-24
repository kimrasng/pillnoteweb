import type { ComponentProps, ReactNode } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { LocaleText } from "./LocaleProvider";

type LinkProps = Omit<ComponentProps<"a">, "children">;

export function TextLink({
  label,
  icon: Icon,
  iconSize = 18,
  ...props
}: LinkProps & {
  readonly label: string;
  readonly icon?: LucideIcon;
  readonly iconSize?: number;
}) {
  return (
    <a {...props}>
      <LocaleText>{label}</LocaleText>
      {Icon && <Icon size={iconSize} aria-hidden="true" />}
    </a>
  );
}

export function BrandLink(props: LinkProps) {
  return (
    <a className="brand" {...props}>
      <img src="/images/pillnote-logo.webp" alt="" />
      <span>PillNote</span>
    </a>
  );
}

export function Disclosure({
  title,
  className,
  iconSize = 19,
  children,
}: {
  readonly title: string;
  readonly className?: string;
  readonly iconSize?: number;
  readonly children: ReactNode;
}) {
  return (
    <details className={className}>
      <summary>
        <LocaleText>{title}</LocaleText>
        <ChevronDown size={iconSize} aria-hidden="true" />
      </summary>
      {children}
    </details>
  );
}
