import { useMemo, useState } from 'react';
import { Heart, TrendingUp, Calendar, DollarSign, MapPin, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppDataStore } from '../store/appDataStore';
import { Button } from '../components';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function PublicProjectsPage() {
  const projects = useAppDataStore((state) => state.projects);
  const grants = useAppDataStore((state) => state.grants);
  const budgetLines = useAppDataStore((state) => state.budgetLines);
  const transactions = useAppDataStore((state) => state.transactions);
  const donors = useAppDataStore((state) => state.donors);

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  // Calculate project funding data
  const projectsWithFunding = useMemo(() => {
    return projects.map((project) => {
      const projectGrant = grants.find((g) => g.grant_id === project.grant_id);
      const projectBudgetLines = budgetLines.filter((bl) => bl.grant_id === project.grant_id);
      const totalBudget = projectBudgetLines.reduce((sum, bl) => sum + bl.allocated_amount, 0);
      const budgetLineIds = projectBudgetLines.map((bl) => bl.budget_line_id);
      const spent = transactions
        .filter((t) => budgetLineIds.includes(t.budget_line_id))
        .reduce((sum, t) => sum + t.amount, 0);
      const fundingGap = totalBudget - spent;
      const fundingProgress = totalBudget > 0 ? (spent / totalBudget) * 100 : 0;
      const donor = projectGrant ? donors.find((d) => d.donor_id === projectGrant.donor_id) : null;

      return {
        ...project,
        totalBudget,
        spent,
        fundingGap,
        fundingProgress,
        donorName: donor?.organization_name || 'Multiple Donors',
        grantAmount: projectGrant?.total_amount || 0,
      };
    });
  }, [projects, grants, budgetLines, transactions, donors]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projectsWithFunding.filter((project) => {
      const matchesCategory = categoryFilter === 'all' || project.status === categoryFilter;
      const matchesSearch =
        searchQuery === '' ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [projectsWithFunding, categoryFilter, searchQuery]);

  const selectedProjectData = selectedProject
    ? projectsWithFunding.find((p) => p.project_id === selectedProject)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore Our Projects</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Discover meaningful initiatives transforming communities across Rwanda. Choose a project that resonates with
              your values and make a lasting impact.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mt-10 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Search projects by name or description..."
                className="flex-1 px-6 py-4 rounded-2xl text-slate-900 shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="px-6 py-4 rounded-2xl text-slate-900 shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 md:w-48"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Projects</option>
                <option value="active">Active</option>
                <option value="pending">Starting Soon</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Total Projects</div>
                <div className="text-2xl font-bold text-slate-900">{projects.length}</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Total Impact</div>
                <div className="text-2xl font-bold text-slate-900">
                  {currency.format(projectsWithFunding.reduce((sum, p) => sum + p.spent, 0))}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Active Donors</div>
                <div className="text-2xl font-bold text-slate-900">{donors.length}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            {filteredProjects.length} {filteredProjects.length === 1 ? 'Project' : 'Projects'} Available
          </h2>
          <p className="text-slate-600 mt-1">Browse and support projects that align with your mission</p>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-slate-600">No projects found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <div
                key={project.project_id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedProject(project.project_id)}
              >
                {/* Project Header */}
                <div className="h-40 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Heart className="h-16 w-16 text-white opacity-50" />
                </div>

                {/* Project Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-slate-900 flex-1">{project.name}</h3>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        project.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : project.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                    {project.description || 'Transforming lives through sustainable development initiatives.'}
                  </p>

                  {/* Project Metrics */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4" />
                      <span>Rwanda</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {project.start_date} - {project.end_date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users className="h-4 w-4" />
                      <span>{project.donorName}</span>
                    </div>
                  </div>

                  {/* Funding Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-slate-900">Funding Progress</span>
                      <span className="text-slate-600">{Math.round(project.fundingProgress)}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
                        style={{ width: `${Math.min(project.fundingProgress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                      <span>Raised: {currency.format(project.spent)}</span>
                      <span>Goal: {currency.format(project.totalBudget)}</span>
                    </div>
                  </div>

                  {/* Funding Gap */}
                  {project.fundingGap > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                      <div className="text-xs font-semibold text-amber-900 mb-1">Funding Needed</div>
                      <div className="text-lg font-bold text-amber-700">{currency.format(project.fundingGap)}</div>
                    </div>
                  )}

                  {/* Action Button */}
                  <button className="w-full btn bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                    View Details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Project Detail Modal */}
      {selectedProjectData && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8">
              <h2 className="text-3xl font-bold mb-2">{selectedProjectData.name}</h2>
              <p className="text-blue-100">
                {selectedProjectData.start_date} - {selectedProjectData.end_date}
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Project Overview</h3>
                <p className="text-slate-600 leading-relaxed">
                  {selectedProjectData.description ||
                    'This project aims to create sustainable development outcomes that transform communities and improve lives across Rwanda. Through strategic partnerships and community engagement, we deliver measurable impact aligned with national development goals.'}
                </p>
              </div>

              {/* Funding Details */}
              <div className="bg-slate-50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Funding Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-600">Total Budget</div>
                    <div className="text-xl font-bold text-slate-900">
                      {currency.format(selectedProjectData.totalBudget)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Amount Spent</div>
                    <div className="text-xl font-bold text-green-600">
                      {currency.format(selectedProjectData.spent)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Funding Gap</div>
                    <div className="text-xl font-bold text-amber-600">
                      {currency.format(selectedProjectData.fundingGap)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Progress</div>
                    <div className="text-xl font-bold text-blue-600">
                      {Math.round(selectedProjectData.fundingProgress)}%
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                      style={{ width: `${Math.min(selectedProjectData.fundingProgress, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Impact Metrics */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Expected Impact</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">500+</div>
                    <div className="text-xs text-slate-600 mt-1">Beneficiaries</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">12</div>
                    <div className="text-xs text-slate-600 mt-1">Months</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">3</div>
                    <div className="text-xs text-slate-600 mt-1">Districts</div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Express Your Interest</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Want to support this project? Let us know and we'll get in touch with more details.
                </p>
                <div className="space-y-3">
                  <input type="text" placeholder="Your Name" className="form-control" />
                  <input type="email" placeholder="Your Email" className="form-control" />
                  <input
                    type="text"
                    placeholder="Organization (Optional)"
                    className="form-control"
                  />
                  <textarea
                    placeholder="Message (Optional)"
                    className="form-control"
                    rows={3}
                  />
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      onClick={() => {
                        alert('Thank you for your interest! Our team will contact you shortly.');
                        setSelectedProject(null);
                      }}
                    >
                      Submit Interest
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedProject(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              </div>

              {/* Login Prompt */}
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600">
                  Already a donor?{' '}
                  <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                    Sign in to your portal
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join our community of donors and help us create lasting impact in Rwanda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/create-account" className="btn btn-lg bg-white text-blue-600 hover:bg-blue-50">
              Become a Donor
            </Link>
            <Link to="/login" className="btn btn-lg border-2 border-white text-white hover:bg-white/10">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
