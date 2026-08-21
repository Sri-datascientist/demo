interface PageHeaderProps {
  title: string;
  titleAccent?: string;
  subtitle?: string;
}

export function PageHeader({ title, titleAccent, subtitle }: PageHeaderProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 pt-12 md:pt-16 pb-10 md:pb-14">
      <h1 className="font-body text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight">
        <span className="text-[#2D5A27]">{title}</span>
        {titleAccent && (
          <>
            {' '}
            <span className="text-[#689F38]">{titleAccent}</span>
          </>
        )}
      </h1>
      {subtitle && (
        <p className="page-lead mt-6 md:mt-8 max-w-3xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
