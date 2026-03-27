import { Star, Github, ExternalLink } from 'lucide-react'

interface Repo {
  name: string
  stars: number
  description: string
  url?: string
  kits?: string[]
}

interface Props {
  repos: Repo[]
}

export default function TopRepos({ repos }: Props) {
  return (
    <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest mb-4">
        Top Integrations on GitHub
      </h2>
      <div className="space-y-3">
        {repos.map((repo, i) => (
          <div key={repo.name} className="flex items-start gap-3">
            <span className="text-xs text-gray-600 w-4 text-right mt-0.5 flex-shrink-0">{i + 1}</span>
            <Github size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              {repo.url ? (
                <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-200 hover:text-indigo-300 transition-colors inline-flex items-center gap-1 truncate">
                  {repo.name} <ExternalLink size={10} className="text-gray-500 flex-shrink-0" />
                </a>
              ) : (
                <p className="text-sm font-medium text-gray-200 truncate">{repo.name}</p>
              )}
              <p className="text-xs text-gray-500 mt-0.5 truncate">{repo.description}</p>
              {repo.kits && repo.kits.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {repo.kits.map(kit => (
                    <span key={kit} className="text-xs bg-indigo-900/40 border border-indigo-700/40 text-indigo-300 px-1.5 py-0.5 rounded-full">
                      {kit.replace('@circle-fin/', '')}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-400 flex-shrink-0">
              <Star size={11} fill="currentColor" />
              {repo.stars.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
